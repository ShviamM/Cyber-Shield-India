import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";

import {
  setCallScreeningEnabled as nativeSetCall,
  setSmsScreeningEnabled as nativeSetSms,
  syncEngineData,
} from "@/lib/screening";

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

type AppContextType = {
  guardianActive: boolean;
  familyMembers: FamilyMember[];
  recentChecks: CheckItem[];
  /** On-device Android call screening preference (persisted). */
  callScreening: boolean;
  /** On-device Android SMS screening preference (persisted). */
  smsScreening: boolean;
  toggleGuardian: () => void;
  addFamilyMember: (member: Omit<FamilyMember, "id">) => void;
  removeFamilyMember: (id: string) => void;
  addCheck: (check: Omit<CheckItem, "id" | "timestamp">) => void;
  setCallScreening: (enabled: boolean) => void;
  setSmsScreening: (enabled: boolean) => void;
};

/** High-risk numbers Netraksh should screen are derived from the user's own
 * danger-flagged checks and family members — kept on-device, no bulk fetch. */
function deriveBlocklist(checks: CheckItem[], family: FamilyMember[]): string[] {
  const fromChecks = checks
    .filter((c) => c.type === "number" && (c.result === "danger" || c.result === "warning"))
    .map((c) => c.value);
  const fromFamily = family.filter((m) => m.status === "danger").map((m) => m.phone);
  return Array.from(new Set([...fromChecks, ...fromFamily]));
}

// Older builds seeded two demo members ("Mummy"/"Papa") into kv_family. Strip
// those legacy records on load so upgraded installs only keep real, user-added
// members. Matches the original seed signature (id + name + phone).
const LEGACY_SEED_SIGNATURES = new Set([
  "m1|Mummy|+91 98765-43210",
  "m2|Papa|+91 87654-32109",
]);

function stripLegacySeed(members: FamilyMember[]): FamilyMember[] {
  return members.filter(
    (m) => !LEGACY_SEED_SIGNATURES.has(`${m.id}|${m.name}|${m.phone}`)
  );
}

const AppContext = createContext<AppContextType>({} as AppContextType);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [guardianActive, setGuardianActive] = useState(true);
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [recentChecks, setRecentChecks] = useState<CheckItem[]>([]);
  const [callScreening, setCallScreeningState] = useState(false);
  const [smsScreening, setSmsScreeningState] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [g, fm, rc, cs, ss] = await Promise.all([
          AsyncStorage.getItem("kv_guardian"),
          AsyncStorage.getItem("kv_family"),
          AsyncStorage.getItem("kv_checks"),
          AsyncStorage.getItem("kv_call_screening"),
          AsyncStorage.getItem("kv_sms_screening"),
        ]);
        if (g !== null) setGuardianActive(JSON.parse(g));
        if (fm) setFamilyMembers(stripLegacySeed(JSON.parse(fm)));
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
      ["kv_family", JSON.stringify(familyMembers)],
      ["kv_checks", JSON.stringify(recentChecks)],
      ["kv_call_screening", JSON.stringify(callScreening)],
      ["kv_sms_screening", JSON.stringify(smsScreening)],
    ]).catch(() => {});
  }, [guardianActive, familyMembers, recentChecks, callScreening, smsScreening, loaded]);

  // Keep the native on-device engine in sync with the user's risk data and
  // toggles. No-op on web / non-Android builds.
  useEffect(() => {
    if (!loaded) return;
    syncEngineData(deriveBlocklist(recentChecks, familyMembers));
  }, [loaded, recentChecks, familyMembers]);

  function toggleGuardian() {
    setGuardianActive((v) => !v);
  }

  function setCallScreening(enabled: boolean) {
    setCallScreeningState(enabled);
    nativeSetCall(enabled);
  }

  function setSmsScreening(enabled: boolean) {
    setSmsScreeningState(enabled);
    nativeSetSms(enabled);
  }

  function addFamilyMember(member: Omit<FamilyMember, "id">) {
    const id =
      Date.now().toString() + Math.random().toString(36).substring(2, 7);
    setFamilyMembers((prev) => [...prev, { ...member, id }]);
  }

  function removeFamilyMember(id: string) {
    setFamilyMembers((prev) => prev.filter((m) => m.id !== id));
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
        recentChecks,
        callScreening,
        smsScreening,
        toggleGuardian,
        addFamilyMember,
        removeFamilyMember,
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
