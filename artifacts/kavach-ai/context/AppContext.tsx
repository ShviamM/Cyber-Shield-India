import AsyncStorage from "@react-native-async-storage/async-storage";
import { useQueryClient } from "@tanstack/react-query";
import {
  acceptFamilyInvite as apiAcceptFamilyInvite,
  addFamilyMember as apiAddFamilyMember,
  declineFamilyInvite as apiDeclineFamilyInvite,
  getGetScreeningBlocklistQueryKey,
  getListFamilyInvitesQueryKey,
  getListFamilyMembersQueryKey,
  removeFamilyMember as apiRemoveFamilyMember,
  resolveFamilyAlert as apiResolveFamilyAlert,
  useGetScreeningBlocklist,
  useListFamilyInvites,
  useListFamilyMembers,
  type FamilyAlert,
  type FamilyInvite,
} from "@workspace/api-client-react";
import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Platform } from "react-native";

import { useAuth } from "@/context/AuthContext";
import {
  setCallScreeningEnabled as nativeSetCall,
  setFamilyAlertsEnabled as nativeSetFamilyAlerts,
  setSmsScreeningEnabled as nativeSetSms,
  syncEngineData,
} from "@/lib/screening";

export type FamilyMember = {
  id: string;
  name: string;
  phone: string;
  relation: string;
  /** "warning" while the member has an unresolved scam-call alert. */
  status: "safe" | "warning" | "danger";
  lastSeen: string;
  /** Family Guardian consent: has the member accepted alerts? */
  inviteStatus: "pending" | "accepted" | "declined";
  /** Most recent unresolved alert from the last 24 hours. */
  latestAlert: FamilyAlert | null;
};

export type CheckItem = {
  id: string;
  type: "number" | "link" | "upi" | "qr" | "message";
  value: string;
  result: "safe" | "warning" | "danger" | "invalid";
  timestamp: number;
};

/** Raised by addFamilyMember when the server rejects the request. The `status`
 * mirrors the HTTP status so the UI can show plan-upsell vs. limit messaging. */
export class FamilyMemberError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.name = "FamilyMemberError";
    this.status = status;
  }
}

type AppContextType = {
  guardianActive: boolean;
  familyMembers: FamilyMember[];
  /** Max family members allowed by the user's current plan (0 = not allowed). */
  familyMaxMembers: number;
  /** The user's current subscription plan. */
  familyPlan: string;
  /** True while the family roster is loading from the server. */
  familyLoading: boolean;
  /** True once the server has returned plan/roster data. Until then, plan-based
   * gating is unknown and the client should defer to the server's response. */
  familyPlanKnown: boolean;
  recentChecks: CheckItem[];
  /** On-device Android call screening preference (persisted). */
  callScreening: boolean;
  /** On-device Android SMS screening preference (persisted). */
  smsScreening: boolean;
  toggleGuardian: () => void;
  /** Add a member on the server. Throws FamilyMemberError on rejection. */
  addFamilyMember: (member: {
    name: string;
    phone: string;
    relationship: string;
  }) => Promise<void>;
  removeFamilyMember: (id: string) => Promise<void>;
  /** Resolve the member's open scam-call alert ("they're safe"). */
  markFamilyMemberSafe: (id: string) => Promise<void>;
  /** Family Guardian invites sent to this user's phone number. */
  familyInvites: FamilyInvite[];
  acceptFamilyInvite: (id: string) => Promise<void>;
  declineFamilyInvite: (id: string) => Promise<void>;
  addCheck: (check: Omit<CheckItem, "id" | "timestamp">) => void;
  setCallScreening: (enabled: boolean) => void;
  setSmsScreening: (enabled: boolean) => void;
};

/** High-risk numbers from the user's own danger/warning-flagged checks. These
 * are merged with the server's community blocklist before syncing on-device. */
function deriveBlocklist(checks: CheckItem[]): string[] {
  const fromChecks = checks
    .filter((c) => c.type === "number" && (c.result === "danger" || c.result === "warning"))
    .map((c) => c.value);
  return Array.from(new Set(fromChecks));
}

const AppContext = createContext<AppContextType>({} as AppContextType);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const { status: authStatus } = useAuth();
  const queryClient = useQueryClient();
  const [recentChecks, setRecentChecks] = useState<CheckItem[]>([]);
  // On-device screening only runs on Android, so default both toggles ON there
  // for a fresh install. A stored preference (below) still overrides this.
  const [callScreening, setCallScreeningState] = useState(
    Platform.OS === "android",
  );
  const [smsScreening, setSmsScreeningState] = useState(
    Platform.OS === "android",
  );
  const [loaded, setLoaded] = useState(false);

  // The family roster is server-owned. Fetch it once authenticated, and poll
  // while the app is open so a Family Guardian alert shows up on the member's
  // card even if its push notification was missed.
  const { data: familyData, isLoading: familyLoading } = useListFamilyMembers({
    query: {
      queryKey: getListFamilyMembersQueryKey(),
      enabled: authStatus === "authenticated",
      refetchInterval: 60_000,
    },
  });

  // Invites other users sent to this user's phone number (the member side).
  const { data: invitesData } = useListFamilyInvites({
    query: {
      queryKey: getListFamilyInvitesQueryKey(),
      enabled: authStatus === "authenticated",
    },
  });
  const familyInvites = invitesData?.invites ?? [];

  // Community-sourced known-scam numbers for on-device call/SMS screening. This
  // is what lets the device warn about scam calls the user never personally
  // checked — basic known-scam screening is a free feature. Android-only.
  const { data: blocklistData } = useGetScreeningBlocklist({
    query: {
      queryKey: getGetScreeningBlocklistQueryKey(),
      enabled: Platform.OS === "android" && authStatus === "authenticated",
      staleTime: 60 * 60 * 1000,
    },
  });
  const serverBlocklist = blocklistData?.phones;

  const familyMembers = useMemo<FamilyMember[]>(() => {
    const members = familyData?.members ?? [];
    return members.map((m) => {
      const alert = m.latestAlert ?? null;
      return {
        id: m.id,
        name: m.name,
        phone: m.phone,
        relation: m.relationship ?? "Other",
        status: alert ? ("warning" as const) : ("safe" as const),
        lastSeen: alert ? new Date(alert.createdAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }) : "",
        inviteStatus: m.status,
        latestAlert: alert,
      };
    });
  }, [familyData]);

  // Family Guardian, member side: once this user has accepted an invite, the
  // native call screener reports incoming calls so the server can alert their
  // guardians. Turned off again if every invite is declined or on sign-out.
  const familyAlertsOn =
    authStatus === "authenticated" && familyInvites.some((i) => i.status === "accepted");
  useEffect(() => {
    if (authStatus === "authenticated" && invitesData === undefined) return;
    nativeSetFamilyAlerts(familyAlertsOn);
  }, [authStatus, invitesData, familyAlertsOn]);

  useEffect(() => {
    (async () => {
      try {
        const [g, rc, cs, ss] = await Promise.all([
          AsyncStorage.getItem("kv_guardian"),
          AsyncStorage.getItem("kv_checks"),
          AsyncStorage.getItem("kv_call_screening"),
          AsyncStorage.getItem("kv_sms_screening"),
        ]);
        // Older builds kept a separate, cosmetic "guardian" flag. It now mirrors
        // call protection, so carry an explicit "off" over once.
        if (g !== null && cs === null && JSON.parse(g) === false) setCallScreeningState(false);
        if (rc) setRecentChecks(JSON.parse(rc));
        if (cs !== null) setCallScreeningState(JSON.parse(cs));
        if (ss !== null) setSmsScreeningState(JSON.parse(ss));
      } catch {}
      setLoaded(true);
    })();
  }, []);

  useEffect(() => {
    if (!loaded) return;
    AsyncStorage.multiSet([
      ["kv_checks", JSON.stringify(recentChecks)],
      ["kv_call_screening", JSON.stringify(callScreening)],
      ["kv_sms_screening", JSON.stringify(smsScreening)],
    ]).catch(() => {});
  }, [recentChecks, callScreening, smsScreening, loaded]);

  // Wipe device-local user data on an actual sign-out / account deletion
  // (authenticated -> unauthenticated), so a deleted or switched account leaves
  // no check history or preferences behind on the device. Resetting in-memory
  // state lets the persistence effect above re-write cleared defaults; we never
  // wipe on the initial unauthenticated load (prev was never "authenticated").
  const prevAuthStatus = useRef(authStatus);
  useEffect(() => {
    const prev = prevAuthStatus.current;
    prevAuthStatus.current = authStatus;
    if (prev === "authenticated" && authStatus === "unauthenticated") {
      setRecentChecks([]);
      setCallScreeningState(Platform.OS === "android");
      setSmsScreeningState(Platform.OS === "android");
    }
  }, [authStatus]);

  // Keep the native on-device engine in sync with the user's risk data and
  // toggles. No-op on web / non-Android builds.
  useEffect(() => {
    if (!loaded) return;
    syncEngineData([
      ...deriveBlocklist(recentChecks),
      ...(serverBlocklist ?? []),
    ]);
  }, [loaded, recentChecks, serverBlocklist]);

  // Keep the native engine's enabled flags in lock-step with the resolved
  // toggle states. This is the single source of native sync: it covers the
  // startup defaults/stored prefs (no manual flip needed) and any later user
  // toggle, and is immune to async-hydration ordering. No-op off Android.
  useEffect(() => {
    if (!loaded) return;
    nativeSetCall(callScreening);
    nativeSetSms(smsScreening);
  }, [loaded, callScreening, smsScreening]);

  // "Guardian" is the user-facing name for call protection: one real setting,
  // synced to the native call screener, not a separate cosmetic flag.
  const guardianActive = callScreening;
  function toggleGuardian() {
    setCallScreeningState((v) => !v);
  }

  // Native sync is handled centrally by the effect above; the setters only
  // update React state (which the effect observes).
  function setCallScreening(enabled: boolean) {
    setCallScreeningState(enabled);
  }

  function setSmsScreening(enabled: boolean) {
    setSmsScreeningState(enabled);
  }

  async function addFamilyMember(member: {
    name: string;
    phone: string;
    relationship: string;
  }) {
    try {
      await apiAddFamilyMember({
        name: member.name,
        phone: member.phone,
        relationship: member.relationship,
      });
    } catch (err) {
      const status =
        typeof err === "object" && err !== null && "status" in err
          ? Number((err as { status: unknown }).status)
          : 0;
      const message = err instanceof Error ? err.message : "Failed to add member";
      throw new FamilyMemberError(status, message);
    }
    await queryClient.invalidateQueries({
      queryKey: getListFamilyMembersQueryKey(),
    });
  }

  async function removeFamilyMember(id: string) {
    await apiRemoveFamilyMember(id);
    await queryClient.invalidateQueries({
      queryKey: getListFamilyMembersQueryKey(),
    });
  }

  async function markFamilyMemberSafe(id: string) {
    const alert = familyMembers.find((m) => m.id === id)?.latestAlert;
    if (!alert) return;
    await apiResolveFamilyAlert(alert.id);
    await queryClient.invalidateQueries({
      queryKey: getListFamilyMembersQueryKey(),
    });
  }

  async function acceptFamilyInvite(id: string) {
    await apiAcceptFamilyInvite(id);
    await queryClient.invalidateQueries({
      queryKey: getListFamilyInvitesQueryKey(),
    });
  }

  async function declineFamilyInvite(id: string) {
    await apiDeclineFamilyInvite(id);
    await queryClient.invalidateQueries({
      queryKey: getListFamilyInvitesQueryKey(),
    });
  }

  function addCheck(check: Omit<CheckItem, "id" | "timestamp">) {
    const id =
      Date.now().toString() + Math.random().toString(36).substring(2, 7);
    setRecentChecks((prev) =>
      [{ ...check, id, timestamp: Date.now() }, ...prev].slice(0, 30)
    );
  }

  return (
    <AppContext.Provider
      value={{
        guardianActive,
        familyMembers,
        familyMaxMembers: familyData?.maxMembers ?? 0,
        familyPlan: familyData?.plan ?? "free",
        familyLoading,
        familyPlanKnown: familyData !== undefined,
        recentChecks,
        callScreening,
        smsScreening,
        toggleGuardian,
        addFamilyMember,
        removeFamilyMember,
        markFamilyMemberSafe,
        familyInvites,
        acceptFamilyInvite,
        declineFamilyInvite,
        addCheck,
        setCallScreening,
        setSmsScreening,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  return useContext(AppContext);
}
