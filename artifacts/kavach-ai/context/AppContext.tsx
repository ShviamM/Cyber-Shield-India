import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";

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
  type: "number" | "link" | "upi" | "qr";
  value: string;
  result: "safe" | "warning" | "danger" | "invalid";
  timestamp: number;
};

type AppContextType = {
  guardianActive: boolean;
  language: "hi" | "en";
  familyMembers: FamilyMember[];
  recentChecks: CheckItem[];
  toggleGuardian: () => void;
  toggleLanguage: () => void;
  addFamilyMember: (member: Omit<FamilyMember, "id">) => void;
  removeFamilyMember: (id: string) => void;
  addCheck: (check: Omit<CheckItem, "id" | "timestamp">) => void;
};

const DEFAULT_MEMBERS: FamilyMember[] = [
  {
    id: "m1",
    name: "Mummy",
    phone: "+91 98765-43210",
    relation: "Mother",
    status: "warning",
    lastSeen: "Just now",
  },
  {
    id: "m2",
    name: "Papa",
    phone: "+91 87654-32109",
    relation: "Father",
    status: "safe",
    lastSeen: "1 hr ago",
  },
];

const AppContext = createContext<AppContextType>({} as AppContextType);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [guardianActive, setGuardianActive] = useState(true);
  const [language, setLanguage] = useState<"hi" | "en">("hi");
  const [familyMembers, setFamilyMembers] =
    useState<FamilyMember[]>(DEFAULT_MEMBERS);
  const [recentChecks, setRecentChecks] = useState<CheckItem[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [g, l, fm, rc] = await Promise.all([
          AsyncStorage.getItem("kv_guardian"),
          AsyncStorage.getItem("kv_lang"),
          AsyncStorage.getItem("kv_family"),
          AsyncStorage.getItem("kv_checks"),
        ]);
        if (g !== null) setGuardianActive(JSON.parse(g));
        if (l) setLanguage(l as "hi" | "en");
        if (fm) setFamilyMembers(JSON.parse(fm));
        if (rc) setRecentChecks(JSON.parse(rc));
      } catch {}
      setLoaded(true);
    })();
  }, []);

  useEffect(() => {
    if (!loaded) return;
    AsyncStorage.multiSet([
      ["kv_guardian", JSON.stringify(guardianActive)],
      ["kv_lang", language],
      ["kv_family", JSON.stringify(familyMembers)],
      ["kv_checks", JSON.stringify(recentChecks)],
    ]).catch(() => {});
  }, [guardianActive, language, familyMembers, recentChecks, loaded]);

  function toggleGuardian() {
    setGuardianActive((v) => !v);
  }

  function toggleLanguage() {
    setLanguage((l) => (l === "hi" ? "en" : "hi"));
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
        language,
        familyMembers,
        recentChecks,
        toggleGuardian,
        toggleLanguage,
        addFamilyMember,
        removeFamilyMember,
        addCheck,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  return useContext(AppContext);
}
