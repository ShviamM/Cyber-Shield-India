import AsyncStorage from "@react-native-async-storage/async-storage";
import { useQueryClient } from "@tanstack/react-query";
import {
  addFamilyMember as apiAddFamilyMember,
  getGetScreeningBlocklistQueryKey,
  getListFamilyMembersQueryKey,
  removeFamilyMember as apiRemoveFamilyMember,
  useGetScreeningBlocklist,
  useListFamilyMembers,
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
  onCallScreened,
  onSmsScreened,
  setCallScreeningEnabled as nativeSetCall,
  setSmsScreeningEnabled as nativeSetSms,
  syncEngineData,
} from "@/lib/screening";
import { tenDigits } from "@/lib/phone";

export type FamilyMember = {
  id: string;
  name: string;
  phone: string;
  relation: string;
  status: "safe" | "warning" | "danger";
  lastSeen: string;
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
  /** Reset a member auto-flagged to "warning" back to "safe". */
  markFamilyMemberSafe: (id: string) => void;
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
  const [guardianActive, setGuardianActive] = useState(true);
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
  // Ephemeral, device-local overlay: ids of members flagged "warning" by the
  // live on-device screener. Not persisted server-side — it resets on reload.
  const [warnings, setWarnings] = useState<Set<string>>(() => new Set());

  // The family roster is server-owned. Fetch it once authenticated.
  const { data: familyData, isLoading: familyLoading } = useListFamilyMembers({
    query: {
      queryKey: getListFamilyMembersQueryKey(),
      enabled: authStatus === "authenticated",
    },
  });

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
      const isWarning = warnings.has(m.id);
      return {
        id: m.id,
        name: m.name,
        phone: m.phone,
        relation: m.relationship ?? "Other",
        status: isWarning ? ("warning" as const) : ("safe" as const),
        lastSeen: isWarning ? "justNow" : "",
      };
    });
  }, [familyData, warnings]);

  // Keep the latest roster available to the screening listeners below without
  // re-subscribing on every roster change.
  const membersRef = useRef(familyMembers);
  membersRef.current = familyMembers;

  useEffect(() => {
    (async () => {
      try {
        const [g, rc, cs, ss] = await Promise.all([
          AsyncStorage.getItem("kv_guardian"),
          AsyncStorage.getItem("kv_checks"),
          AsyncStorage.getItem("kv_call_screening"),
          AsyncStorage.getItem("kv_sms_screening"),
        ]);
        if (g !== null) setGuardianActive(JSON.parse(g));
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
      ["kv_guardian", JSON.stringify(guardianActive)],
      ["kv_checks", JSON.stringify(recentChecks)],
      ["kv_call_screening", JSON.stringify(callScreening)],
      ["kv_sms_screening", JSON.stringify(smsScreening)],
    ]).catch(() => {});
  }, [guardianActive, recentChecks, callScreening, smsScreening, loaded]);

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
      setWarnings(new Set());
      setGuardianActive(true);
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

  // Live Family Shield: when the on-device engine screens a risky call/SMS and
  // the caller/sender matches a saved family contact, flag that member as
  // "warning" so their card surfaces the alert. No-op on web / non-Android.
  useEffect(() => {
    if (!loaded) return;
    const flagByPhone = (raw: string) => {
      const key = tenDigits(raw);
      if (!key) return;
      const match = membersRef.current.find((m) => tenDigits(m.phone) === key);
      if (!match) return;
      setWarnings((prev) => {
        if (prev.has(match.id)) return prev;
        const next = new Set(prev);
        next.add(match.id);
        return next;
      });
    };
    const callSub = onCallScreened((e) => {
      if (e.blocked) flagByPhone(e.number);
    });
    // Any screened SMS reached us because it matched a blocked sender or a scam
    // keyword — both are risk signals worth flagging the contact for.
    const smsSub = onSmsScreened((e) => flagByPhone(e.sender));
    return () => {
      callSub.remove();
      smsSub.remove();
    };
  }, [loaded]);

  function toggleGuardian() {
    setGuardianActive((v) => !v);
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
    setWarnings((prev) => {
      if (!prev.has(id)) return prev;
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
    await queryClient.invalidateQueries({
      queryKey: getListFamilyMembersQueryKey(),
    });
  }

  function markFamilyMemberSafe(id: string) {
    setWarnings((prev) => {
      if (!prev.has(id)) return prev;
      const next = new Set(prev);
      next.delete(id);
      return next;
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
