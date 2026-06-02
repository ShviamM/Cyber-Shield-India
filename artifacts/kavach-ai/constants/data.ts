export type GoldenRule = {
  id: string;
  icon: string;
  hindi: string;
  english: string;
  severity: "critical" | "important" | "tip";
};

export const GOLDEN_RULES: GoldenRule[] = [
  {
    id: "1",
    icon: "shield-off",
    hindi: "OTP कभी मत दो",
    english: "Never share OTP — not even to 'bank staff'",
    severity: "critical",
  },
  {
    id: "2",
    icon: "phone-off",
    hindi: "अनजान नंबर पर भरोसा मत करो",
    english: "Verify callers independently before taking action",
    severity: "critical",
  },
  {
    id: "3",
    icon: "dollar-sign",
    hindi: "डर से पैसे मत भेजो",
    english: "Urgency + threats = scam. Always pause and verify.",
    severity: "critical",
  },
  {
    id: "4",
    icon: "link",
    hindi: "लिंक क्लिक से पहले जाँचो",
    english: "Verify links before clicking — use the Verify tab",
    severity: "important",
  },
  {
    id: "5",
    icon: "users",
    hindi: "बुजुर्गों को सतर्क करो",
    english: "Educate elderly family members about common scams",
    severity: "important",
  },
];
