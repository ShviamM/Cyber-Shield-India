export type Threat = {
  id: string;
  type: string;
  city: string;
  count: number;
  trend: "critical" | "high" | "medium";
  description: string;
  time: string;
};

export type CityHotspot = {
  rank: number;
  city: string;
  cases: number;
  change: string;
  up: boolean;
};

export type GoldenRule = {
  id: string;
  icon: string;
  hindi: string;
  english: string;
  severity: "critical" | "important" | "tip";
};

export const SCAM_OF_DAY = {
  tag: "TRENDING TODAY",
  title: "Fake FedEx Parcel Hold",
  titleHindi: "नकली FedEx पार्सल कॉल",
  description:
    "Caller claims your parcel is held at customs. Asks for 'customs clearance fee' via UPI or net banking.",
  descriptionHindi:
    "कॉलर दावा करता है कि आपका पार्सल कस्टम में फंसा है। UPI से शुल्क माँगता है।",
  reports: 2341,
  cities: ["Mumbai", "Bengaluru", "Hyderabad"],
  tip: "Real couriers NEVER ask for payment over the phone.",
  tipHindi: "असली कूरियर कभी फोन पर पैसे नहीं माँगते।",
};

export const LIVE_THREATS: Threat[] = [
  {
    id: "1",
    type: "Fake FedEx / Courier",
    city: "Mumbai",
    count: 2341,
    trend: "critical",
    description:
      "Fraudsters impersonating courier services to collect 'customs fees'",
    time: "2 min ago",
  },
  {
    id: "2",
    type: "WhatsApp OTP Fraud",
    city: "Delhi NCR",
    count: 1872,
    trend: "critical",
    description:
      "Victims tricked into sharing OTP under the guise of WhatsApp verification",
    time: "15 min ago",
  },
  {
    id: "3",
    type: "Fake Jio Offer",
    city: "Bengaluru",
    count: 943,
    trend: "high",
    description:
      "Fraudulent SMS/calls offering free Jio data in exchange for UPI credentials",
    time: "1 hr ago",
  },
  {
    id: "4",
    type: "Income Tax Refund",
    city: "Pune",
    count: 612,
    trend: "high",
    description:
      "Fake IT dept calls demanding KYC to release 'pending refund'",
    time: "3 hr ago",
  },
  {
    id: "5",
    type: "Electricity Disconnection",
    city: "Chennai",
    count: 488,
    trend: "medium",
    description:
      "SMS claiming power will be cut unless immediate payment via UPI",
    time: "5 hr ago",
  },
  {
    id: "6",
    type: "Aadhaar Deactivation",
    city: "Kolkata",
    count: 314,
    trend: "medium",
    description:
      "Calls claiming Aadhaar will be deactivated unless details verified",
    time: "8 hr ago",
  },
];

export const CITY_HOTSPOTS: CityHotspot[] = [
  { rank: 1, city: "Mumbai", cases: 8912, change: "+23%", up: true },
  { rank: 2, city: "Delhi NCR", cases: 7841, change: "+18%", up: true },
  { rank: 3, city: "Bengaluru", cases: 5632, change: "+31%", up: true },
  { rank: 4, city: "Hyderabad", cases: 4129, change: "-5%", up: false },
  { rank: 5, city: "Pune", cases: 3087, change: "+9%", up: true },
  { rank: 6, city: "Chennai", cases: 2941, change: "-2%", up: false },
];

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
