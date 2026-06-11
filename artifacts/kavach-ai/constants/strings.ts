/**
 * Non-text constants for Netraksh.
 *
 * All user-facing copy now lives in `i18n/locales/*` and is accessed via the
 * `t()` translation function (see `i18n/`). This file keeps only language-neutral
 * metadata: icon mappings, the canonical IDs/icons for static educational
 * content, and official contact constants.
 */

import type { Feather } from "@expo/vector-icons";

type FeatherName = React.ComponentProps<typeof Feather>["name"];

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
  scam_call: "alert-octagon",
  fraud_call: "alert-triangle",
  spam_call: "slash",
  telemarketing: "volume-2",
  other: "alert-circle",
};

export function categoryIcon(key: string): FeatherName {
  return CATEGORY_ICONS[key] ?? "alert-circle";
}

/**
 * Simple call-type categories used by the one-tap post-call report
 * (`app/report-call.tsx`). They are filtered OUT of the detailed fraud-incident
 * pickers (manual report form and in-call report sheet), which keep the richer
 * scam-type taxonomy. Order here drives the order of the quick-report buttons.
 */
export const CALL_REPORT_CATEGORY_KEYS = [
  "scam_call",
  "fraud_call",
  "spam_call",
  "telemarketing",
] as const;

export type CallReportCategoryKey = (typeof CALL_REPORT_CATEGORY_KEYS)[number];

const CALL_REPORT_KEY_SET = new Set<string>(CALL_REPORT_CATEGORY_KEYS);

/** True for the simple call-type keys that belong only to the quick report. */
export function isCallReportCategory(key: string): boolean {
  return CALL_REPORT_KEY_SET.has(key);
}

/**
 * Language-neutral metadata for the cyber-safety education topics. The text
 * (title/summary/tips) lives under the `safety.topics` key in each locale,
 * indexed in the same order as this list.
 */
export const SAFETY_TOPIC_META: { id: string; icon: FeatherName }[] = [
  { id: "phishing", icon: "link" },
  { id: "otp", icon: "key" },
  { id: "upi", icon: "credit-card" },
  { id: "loan_apps", icon: "dollar-sign" },
  { id: "impersonation", icon: "user-x" },
];

/** Number of post-scam helpline steps (text lives under `helpline.steps`). */
export const HELPLINE_STEP_COUNT = 5;

export const HELPLINE_NUMBER = "1930";
export const CYBERCRIME_PORTAL_URL = "https://cybercrime.gov.in";
