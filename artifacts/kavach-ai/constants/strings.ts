/**
 * Centralized user-facing copy for KavachAI V2 features.
 *
 * ALL new strings live here so a future i18n pass (Task #3) can localize the
 * app from a single source. Keep keys descriptive and grouped by feature.
 * Existing legacy bilingual content (threat feed, golden rules) still lives in
 * `constants/data.ts`; new screens should pull copy from here.
 */

import type { Feather } from "@expo/vector-icons";

type FeatherName = React.ComponentProps<typeof Feather>["name"];

export const STRINGS = {
  common: {
    appName: "KavachAI",
    back: "Back",
    cancel: "Cancel",
    retry: "Try Again",
    continue: "Continue",
    submit: "Submit",
    loading: "Loading…",
    somethingWrong: "Something went wrong",
    checkConnection: "Please check your connection and try again.",
    optional: "Optional",
    required: "Required",
  },

  auth: {
    // Phone step
    welcomeTitle: "Welcome to KavachAI",
    welcomeSub: "India's prevention-first shield against cyber crime & scam calls.",
    phoneLabel: "Mobile Number",
    phonePlaceholder: "98765 43210",
    phoneHint: "We'll send a one-time code to verify it's you.",
    sendOtp: "Send OTP",
    invalidPhone: "Enter a valid 10-digit Indian mobile number.",
    // Details step (new users)
    detailsTitle: "Create your account",
    detailsSub: "Tell us a little about you to finish signing up.",
    nameLabel: "Full Name",
    namePlaceholder: "e.g. Rahul Sharma",
    locationLabel: "City / Location",
    locationPlaceholder: "e.g. Mumbai, Maharashtra",
    nameRequired: "Please enter your name.",
    // OTP step
    otpTitle: "Enter the code",
    otpSubPrefix: "We sent a 6-digit code to ",
    otpPlaceholder: "6-digit code",
    verify: "Verify & Continue",
    invalidOtp: "Enter the 6-digit code.",
    resend: "Resend code",
    resendIn: (s: number) => `Resend code in ${s}s`,
    devOtpPrefix: "Dev code: ",
    changeNumber: "Change number",
    otpSent: "Code sent",
    // Errors
    requestFailed: "Could not send the code. Please try again.",
    verifyFailed: "Could not verify the code. Please try again.",
  },

  profile: {
    signOut: "Sign Out",
    signOutConfirmTitle: "Sign Out",
    signOutConfirmMsg: "You'll need to verify your number again to sign back in.",
    member: "KavachAI member",
    protected: "Protected",
    paused: "Paused",
    sectionProtection: "PROTECTION",
    sectionLanguage: "LANGUAGE",
    sectionServices: "QUICK SERVICES",
    sectionLearn: "LEARN & REPORT",
    sectionAbout: "ABOUT",
    guardianMode: "Guardian Mode",
    guardianModeSub: "Real-time scam call warnings",
    notifications: "Threat Notifications",
    notificationsSub: "Alerts for new scams in your city",
    displayLanguage: "Display Language",
    helplineCardTitle: "Cyber Crime Helpline",
    helplineCardSub: "Call immediately if you've been scammed",
    aboutTitle: "About KavachAI",
    aboutSub: "Prevention-first cyber safety for India",
    privacyTitle: "Privacy Policy",
    privacySub: "How we protect your data",
    rateTitle: "Rate KavachAI",
    rateSub: "Help us protect more Indians",
    version: "KavachAI v2.0.0 · Made for India",
  },

  services: {
    reportFraud: "Report a Fraud Number",
    reportFraudSub: "Warn the community",
    scamCategories: "Scam Categories",
    scamCategoriesSub: "Know the tricks",
    safetyTips: "Cyber Safety Tips",
    safetyTipsSub: "Stay protected",
    helpline: "Emergency & Helpline",
    helplineSub: "1930 · Report cyber crime",
  },

  verify: {
    title: "Verify Before You Act",
    sub: "Check anything suspicious instantly",
    checkBeforeAnswering: "Check a number before answering",
    checkBeforeAnsweringSub: "See community reports before you pick up",
    checkNow: "Check Now",
    checking: "Checking…",
    enterValue: "Enter a value to check",
    reportThisNumber: "Report this number",
    reportCount: (n: number) =>
      n === 1 ? "1 community report" : `${n.toLocaleString("en-IN")} community reports`,
    noReports: "No community reports yet",
    relatedCategories: "Reported for",
    checkFailed: "Couldn't check this number. Please try again.",
    // Risk copy keyed by backend riskLevel
    risk: {
      high: {
        headline: "HIGH RISK — Likely Fraud",
        detail:
          "This number has multiple community reports. Do NOT share OTP, PIN, or make any payment. Hang up and verify through official channels.",
      },
      medium: {
        headline: "Suspicious — Be Careful",
        detail:
          "This number has been reported. Proceed with caution and never share personal details, OTP, or money.",
      },
      low: {
        headline: "Low Risk",
        detail:
          "Only a few or no recent reports. Still, always verify the caller's identity before sharing anything.",
      },
      unknown: {
        headline: "No Reports Found",
        detail:
          "No community fraud reports for this number yet. Stay alert and never share OTP or money on an unverified call.",
      },
    },
    verifiedScam: "Verified scam by KavachAI moderators",
  },

  report: {
    title: "Report a Fraud Number",
    intro: "Your report helps warn millions of Indians. It takes less than a minute.",
    phoneLabel: "Fraud Number",
    phonePlaceholder: "98765 43210",
    invalidPhone: "Enter a valid 10-digit Indian mobile number.",
    alreadyReported: (n: number) =>
      `This number already has ${n.toLocaleString("en-IN")} report${n === 1 ? "" : "s"}. Adding yours strengthens the warning.`,
    verifiedScamWarning: "This number is already flagged as a verified scam.",
    categoryLabel: "Type of Scam",
    categoryRequired: "Please choose a scam type.",
    categoryLoadError: "Couldn't load scam types. Pull to retry.",
    descriptionLabel: "What happened?",
    descriptionPlaceholder:
      "Describe the call or message — what they claimed, what they asked for…",
    descriptionRequired: "Please add a short description.",
    descriptionTooShort: "Please add a little more detail (at least 10 characters).",
    incidentDateLabel: "When did it happen?",
    incidentDateHint: "Optional — helps moderators verify",
    today: "Today",
    submit: "Submit Report",
    submitting: "Submitting…",
    successTitle: "Report submitted",
    successMsg: "Thank you for helping protect the community.",
    submitFailed: "Couldn't submit your report. Please try again.",
    done: "Done",
    disclaimer:
      "Reports are reviewed by moderators. False reports may be removed. For financial loss, also call 1930.",
  },

  categories: {
    title: "Scam Categories",
    intro: "Learn how the most common scams in India work so you can spot them early.",
    empty: "No categories available yet.",
    loadError: "Couldn't load scam categories.",
    reportCta: "Report a number in this category",
  },

  safety: {
    title: "Cyber Safety",
    intro: "Quick, practical guidance to keep you and your family safe online.",
    tipsHeading: "What to do",
  },

  helpline: {
    title: "Emergency & Helpline",
    sosTitle: "Cyber Crime Helpline 1930",
    sosSub: "Call now if you've lost money or shared sensitive details.",
    callNow: "Call 1930",
    portalTitle: "National Cyber Crime Portal",
    portalSub: "File a detailed complaint online",
    portalCta: "Open cybercrime.gov.in",
    stepsTitle: "If you've been scammed",
    disclaimerTitle: "Stay safe while reporting",
    disclaimer:
      "KavachAI never asks for your OTP, PIN, or passwords. Always verify official helpline numbers and websites yourself — scammers often pose as 'support agents'. Only 1930 and cybercrime.gov.in are official Government of India channels.",
  },
} as const;

/** Maps a backend scam-category key to a Feather icon. */
export const CATEGORY_ICONS: Record<string, FeatherName> = {
  upi_fraud: "credit-card",
  otp_scam: "key",
  kyc_fraud: "file-text",
  loan_scam: "dollar-sign",
  job_scam: "briefcase",
  lottery_scam: "gift",
  investment_fraud: "trending-up",
  digital_arrest: "shield",
  electricity_bill: "zap",
  courier_scam: "package",
  tech_support: "tool",
  impersonation: "user-x",
  sextortion: "lock",
  other: "alert-circle",
};

export function categoryIcon(key: string): FeatherName {
  return CATEGORY_ICONS[key] ?? "alert-circle";
}

/** Cyber-safety education topics (static content, centralized for i18n). */
export type SafetyTopic = {
  id: string;
  icon: FeatherName;
  title: string;
  summary: string;
  tips: string[];
};

export const SAFETY_TOPICS: SafetyTopic[] = [
  {
    id: "phishing",
    icon: "link",
    title: "Phishing Links & Fake Websites",
    summary:
      "Fraudsters send links that look official (banks, KYC, refunds) to steal your login or card details.",
    tips: [
      "Never click links in unexpected SMS, WhatsApp, or email.",
      "Type bank and government website addresses yourself.",
      "Check for spelling tricks in the domain (e.g. sbi-kyc-update.com).",
      "Use the Verify tab to check a link before opening it.",
    ],
  },
  {
    id: "otp",
    icon: "key",
    title: "OTP & PIN Theft",
    summary:
      "No genuine bank, company, or government office will EVER ask for your OTP, PIN, or CVV.",
    tips: [
      "Never share an OTP — not even with 'bank staff' or 'police'.",
      "An OTP for a refund is actually authorising a payment FROM you.",
      "Don't read codes aloud on a call.",
      "Enable transaction alerts on your bank account.",
    ],
  },
  {
    id: "upi",
    icon: "credit-card",
    title: "UPI & Payment Scams",
    summary:
      "You never enter a UPI PIN to RECEIVE money. Requests to 'approve to receive' are scams.",
    tips: [
      "Entering your UPI PIN always means money LEAVES your account.",
      "Verify the receiver's name before sending money.",
      "Be wary of 'wrong transfer, please return' tricks.",
      "Scan only QR codes you trust — a QR can request a payment.",
    ],
  },
  {
    id: "loan_apps",
    icon: "dollar-sign",
    title: "Fake Loan & Credit Apps",
    summary:
      "Instant-loan apps lure you with quick money, then harass and blackmail using your contacts and photos.",
    tips: [
      "Only borrow from RBI-registered banks or NBFCs.",
      "Don't grant apps access to contacts, gallery, or messages.",
      "Avoid apps demanding fees before disbursing a loan.",
      "Check reviews and the developer before installing.",
    ],
  },
  {
    id: "impersonation",
    icon: "user-x",
    title: "Police, Bank & Govt Impersonation",
    summary:
      "Scammers pose as police ('digital arrest'), bank officers, or officials to frighten you into paying.",
    tips: [
      "Real police never arrest or 'fine' you over a video call.",
      "Hang up and call the official number from the bank's website.",
      "Urgency + threats + secrecy = scam. Pause and verify.",
      "Talk to family before acting on any scary call.",
    ],
  },
];

/** Steps to follow after being scammed (helpline screen). */
export const HELPLINE_STEPS: string[] = [
  "Call 1930 immediately — the sooner you report, the better the chance of freezing the money.",
  "File a complaint at cybercrime.gov.in with all details and screenshots.",
  "Inform your bank to block the card/account and stop further transactions.",
  "Save evidence: numbers, messages, transaction IDs, and screenshots.",
  "Report the number in KavachAI to warn others.",
];

export const HELPLINE_NUMBER = "1930";
export const CYBERCRIME_PORTAL_URL = "https://cybercrime.gov.in";
