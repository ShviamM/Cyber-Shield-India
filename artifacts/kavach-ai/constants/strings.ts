/**
 * Non-text constants for KavachAI.
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
  other: "alert-circle",
};

export function categoryIcon(key: string): FeatherName {
  return CATEGORY_ICONS[key] ?? "alert-circle";
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
