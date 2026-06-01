import type { FraudVerdictRiskLevel } from "@workspace/api-zod";
import { normalizeIndianPhone } from "../lib/phone";
import { computeRiskLevel } from "../lib/reputation";
import type { Example, Prediction, ReputationContext, ReputationMap } from "./types";

/**
 * The "old" rule-based detector: flat keyword / blacklist / format rules with no
 * scoring, no link structure analysis, no reputation cross-referencing across
 * embedded entities, and no AI. This is the baseline the multi-signal engine is
 * measured against. It intentionally mirrors the simple heuristics such systems
 * historically shipped with.
 */

// Substring triggers a naive SMS/chat scam filter would match (case-insensitive).
const MESSAGE_KEYWORDS = [
  "otp",
  "kyc",
  "lottery",
  "won",
  "winner",
  "prize",
  "blocked",
  "urgent",
  "verify",
  "click here",
  "account",
  "refund",
  "suspended",
  "password",
];

// Keywords a naive filter would scan for anywhere in a URL string.
const URL_KEYWORDS = [
  "login",
  "verify",
  "kyc",
  "otp",
  "account",
  "secure",
  "update",
  "refund",
  "password",
  "bank",
  "wallet",
];

// A short, hand-maintained allowlist — the classic way old systems judged UPI.
const LEGACY_KNOWN_HANDLES = new Set([
  "oksbi",
  "okhdfcbank",
  "okicici",
  "okaxis",
  "ybl",
  "paytm",
  "upi",
]);

const LEGACY_SHORTENERS = ["bit.ly", "tinyurl.com", "t.co", "goo.gl", "rb.gy"];

function flaggedHigh(): Prediction {
  return { riskLevel: "high", flagged: true };
}

function unknownClean(): Prediction {
  return { riskLevel: "unknown", flagged: false };
}

function classifyPhone(rep: ReputationContext | undefined): Prediction {
  const reportCount = rep?.reportCount ?? 0;
  const verifiedScam = rep?.verifiedScam ?? false;
  const lastReportedAt =
    rep && rep.lastReportedDaysAgo != null
      ? new Date(Date.now() - rep.lastReportedDaysAgo * 24 * 60 * 60 * 1000)
      : null;
  const riskLevel: FraudVerdictRiskLevel = computeRiskLevel({
    verifiedScam,
    reportCount,
    lastReportedAt,
  });
  return { riskLevel, flagged: riskLevel === "high" || riskLevel === "medium" };
}

function classifyUrl(raw: string): Prediction {
  const lower = raw.toLowerCase();
  if (LEGACY_SHORTENERS.some((s) => lower.includes(s))) return flaggedHigh();
  if (URL_KEYWORDS.some((k) => lower.includes(k))) return flaggedHigh();
  return unknownClean();
}

function classifyUpi(raw: string): Prediction {
  const value = raw.trim().toLowerCase();
  const handle = value.includes("@") ? value.split("@")[1] : "";
  if (!handle) return unknownClean();
  return LEGACY_KNOWN_HANDLES.has(handle) ? unknownClean() : flaggedHigh();
}

function classifyMessage(text: string): Prediction {
  const lower = text.toLowerCase();
  return MESSAGE_KEYWORDS.some((k) => lower.includes(k)) ? flaggedHigh() : unknownClean();
}

export function legacyClassify(ex: Example, repMap: ReputationMap): Prediction {
  switch (ex.type) {
    case "phone": {
      const normalized = normalizeIndianPhone(ex.value);
      const rep = ex.reputation ?? (normalized ? repMap.get(normalized) : undefined);
      return classifyPhone(rep);
    }
    case "url":
      return classifyUrl(ex.value);
    case "upi":
      return classifyUpi(ex.value);
    case "message":
      return classifyMessage(ex.value);
  }
}
