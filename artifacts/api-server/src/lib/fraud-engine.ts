import { db, numberReputationTable, scamCategoriesTable } from "@workspace/db";
import { asc, eq } from "drizzle-orm";
import type { FraudSignal, FraudVerdict } from "@workspace/api-zod";
import { normalizeIndianPhone } from "./phone";
import { computeRiskLevel, getCategoriesForNumber } from "./reputation";
import { classifyMessage, classifyUrl, type UrlClassification } from "./ai-classifier";
import { analyzeUrlHeuristics, checkSafeBrowsing } from "./url-analysis";
import { analyzeUpi } from "./upi";

export type FraudCheckType = "phone" | "url" | "upi" | "message";

export const SEVERITY_WEIGHT: Record<FraudSignal["severity"], number> = {
  info: 0,
  low: 12,
  // A lone "medium" signal must reach the medium verdict band (>= 40) on its
  // own, so a single community-"medium" phone reputation warns the user instead
  // of fusing down to "low". Weight is aligned with the medium threshold.
  medium: 40,
  high: 55,
};

/** Limit how many embedded entities we expand from a single message. */
const MAX_EMBEDDED = 3;

type Analysis = {
  signals: FraudSignal[];
  /** True when at least one analyzer produced a definitive assessment. */
  couldAnalyze: boolean;
  category?: string | null;
  confidence?: number | null;
};

export function fuse(
  signals: FraudSignal[],
  couldAnalyze: boolean,
): { score: number; riskLevel: FraudVerdict["riskLevel"] } {
  const total = signals.reduce((sum, s) => sum + SEVERITY_WEIGHT[s.severity], 0);
  const score = Math.min(100, total);

  let riskLevel: FraudVerdict["riskLevel"];
  if (score >= 70) riskLevel = "high";
  else if (score >= 40) riskLevel = "medium";
  else if (score >= 15) riskLevel = "low";
  else riskLevel = couldAnalyze ? "low" : "unknown";

  return { score, riskLevel };
}

// ---- Per-target analyzers -------------------------------------------------

async function analyzePhoneTarget(phone: string): Promise<Analysis> {
  const [rep] = await db
    .select()
    .from(numberReputationTable)
    .where(eq(numberReputationTable.phone, phone))
    .limit(1);

  const reportCount = rep?.reportCount ?? 0;
  const verifiedScam = rep?.verifiedScam ?? false;
  const lastReportedAt = rep?.lastReportedAt ?? null;
  const hasData = reportCount > 0 || verifiedScam;

  const signals: FraudSignal[] = [];

  if (verifiedScam) {
    signals.push({
      source: "phone_reputation",
      severity: "high",
      label: "Confirmed scam number verified by Netraksh moderators.",
    });
  } else {
    const level = computeRiskLevel({ verifiedScam, reportCount, lastReportedAt });
    if (level === "high") {
      signals.push({
        source: "phone_reputation",
        severity: "high",
        label: `Reported ${reportCount} time(s) by the community.`,
      });
    } else if (level === "medium") {
      signals.push({
        source: "phone_reputation",
        severity: "medium",
        label: `Reported ${reportCount} time(s) by the community.`,
      });
    } else if (level === "low") {
      signals.push({
        source: "phone_reputation",
        severity: "low",
        label: `Reported ${reportCount} time(s) by the community.`,
      });
    } else {
      signals.push({
        source: "phone_reputation",
        severity: "info",
        label: "No community reports yet for this number.",
      });
    }
  }

  // Surface the most-reported category for context (does not change the score).
  if (hasData) {
    const cats = await getCategoriesForNumber(phone);
    return {
      signals,
      couldAnalyze: true,
      category: cats[0]?.key ?? null,
    };
  }

  return { signals, couldAnalyze: hasData };
}

/**
 * Map an AI URL-reputation verdict to a fraud signal, or null when the model
 * had no usable opinion (so it adds no weight). A high-confidence "malicious"
 * verdict emits a "high" signal: on its own that lands in the medium band, and
 * reaches the high band once any heuristic / threat-feed signal corroborates it
 * — the engine deliberately requires corroboration for the top band (see
 * SEVERITY_WEIGHT, where a lone high = 55 < the high threshold of 70).
 * "suspicious" stays advisory (low/medium); "likely_safe"/"unknown" never warn.
 */
export function urlAiSignal(result: UrlClassification): FraudSignal | null {
  const { verdict, confidence, rationale } = result;
  let severity: FraudSignal["severity"];
  switch (verdict) {
    case "malicious":
      severity = confidence >= 0.75 ? "high" : "medium";
      break;
    case "suspicious":
      severity = confidence >= 0.75 ? "medium" : "low";
      break;
    case "likely_safe":
      severity = "info";
      break;
    default:
      return null;
  }
  return { source: "url_ai", severity, label: rationale };
}

async function analyzeUrlTarget(raw: string): Promise<Analysis> {
  const { url, signals } = analyzeUrlHeuristics(raw);
  if (!url) {
    return { signals, couldAnalyze: false };
  }
  const [safeBrowsing, aiResult] = await Promise.all([
    checkSafeBrowsing(url),
    classifyUrl(url.toString()),
  ]);
  signals.push(safeBrowsing);
  if (aiResult) {
    const signal = urlAiSignal(aiResult);
    if (signal) signals.push(signal);
  }
  return { signals, couldAnalyze: true };
}

async function analyzeUpiTarget(raw: string): Promise<Analysis> {
  const { upiId, embeddedPhone, signals } = analyzeUpi(raw);
  if (!upiId) {
    return { signals, couldAnalyze: false };
  }
  if (embeddedPhone) {
    const normalized = normalizeIndianPhone(embeddedPhone);
    if (normalized) {
      const phoneAnalysis = await analyzePhoneTarget(normalized);
      signals.push(...phoneAnalysis.signals);
    }
  }
  return { signals, couldAnalyze: true };
}

export function extractEntities(text: string): {
  urls: string[];
  upis: string[];
  phones: string[];
} {
  const urls = [
    ...new Set(
      (text.match(/(https?:\/\/[^\s<>"']+|www\.[^\s<>"']+)/gi) ?? []).map((u) =>
        u.replace(/[.,)\]]+$/, ""),
      ),
    ),
  ].slice(0, MAX_EMBEDDED);

  const upis = [
    ...new Set(
      (text.match(/\b[a-z0-9.\-_]{2,}@[a-z]{2,}\b/gi) ?? [])
        .filter((m) => !/\.[a-z]{2,}$/i.test(m)) // drop email-looking matches
        .map((u) => u.toLowerCase()),
    ),
  ].slice(0, MAX_EMBEDDED);

  const phones = [
    ...new Set(
      (text.match(/(?:\+?91[\s-]?|0)?[6-9]\d{9}\b/g) ?? [])
        .map((p) => normalizeIndianPhone(p))
        .filter((p): p is string => Boolean(p)),
    ),
  ].slice(0, MAX_EMBEDDED);

  return { urls, upis, phones };
}

async function analyzeMessageTarget(text: string): Promise<Analysis> {
  const signals: FraudSignal[] = [];
  let couldAnalyze = false;
  let category: string | null = null;
  let confidence: number | null = null;

  const categories = await db
    .select({ key: scamCategoriesTable.key, nameEn: scamCategoriesTable.nameEn })
    .from(scamCategoriesTable)
    .orderBy(asc(scamCategoriesTable.sortOrder));
  const nameByKey = new Map(categories.map((c) => [c.key, c.nameEn]));

  const classification = await classifyMessage(text, categories);
  if (classification) {
    couldAnalyze = true;
    category = classification.category;
    confidence = classification.confidence;
    if (classification.isScam) {
      const severity: FraudSignal["severity"] =
        classification.confidence >= 0.75
          ? "high"
          : classification.confidence >= 0.4
            ? "medium"
            : "low";
      const catName = classification.category
        ? nameByKey.get(classification.category) ?? null
        : null;
      signals.push({
        source: "message_ai",
        severity,
        label: catName
          ? `AI detected a likely ${catName} scam: ${classification.rationale}`
          : `AI detected likely scam patterns: ${classification.rationale}`,
      });
    } else {
      signals.push({
        source: "message_ai",
        severity: "info",
        label: `AI did not detect scam patterns: ${classification.rationale}`,
      });
    }
  } else {
    signals.push({
      source: "message_ai",
      severity: "info",
      label: "AI message analysis is unavailable; used embedded-link checks only.",
    });
  }

  // Fuse in any links / UPI IDs / numbers embedded in the message.
  const { urls, upis, phones } = extractEntities(text);
  for (const u of urls) {
    const r = await analyzeUrlTarget(u);
    if (r.couldAnalyze) couldAnalyze = true;
    signals.push(...r.signals);
  }
  for (const u of upis) {
    const r = await analyzeUpiTarget(u);
    if (r.couldAnalyze) couldAnalyze = true;
    signals.push(...r.signals);
  }
  for (const p of phones) {
    const r = await analyzePhoneTarget(p);
    if (r.couldAnalyze) couldAnalyze = true;
    signals.push(...r.signals);
  }

  return { signals, couldAnalyze, category, confidence };
}

// ---- Public entry point ---------------------------------------------------

function dedupeSignals(signals: FraudSignal[]): FraudSignal[] {
  const seen = new Set<string>();
  const out: FraudSignal[] = [];
  for (const s of signals) {
    const key = `${s.source}|${s.severity}|${s.label}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(s);
  }
  return out;
}

function echoValue(type: FraudCheckType, raw: string, normalized?: string): string {
  if (type === "message") return raw.trim().slice(0, 500);
  return normalized ?? raw.trim();
}

export async function runFraudCheck(
  type: FraudCheckType,
  rawValue: string,
): Promise<FraudVerdict> {
  let analysis: Analysis;
  let value: string;

  switch (type) {
    case "phone": {
      const phone = normalizeIndianPhone(rawValue);
      if (!phone) {
        return {
          type,
          value: rawValue.trim().slice(0, 120),
          riskLevel: "unknown",
          score: 0,
          category: null,
          confidence: null,
          reasons: ["Not a valid 10-digit Indian mobile number."],
          signals: [
            {
              source: "phone_reputation",
              severity: "info",
              label: "Could not parse a valid Indian phone number.",
            },
          ],
        };
      }
      analysis = await analyzePhoneTarget(phone);
      value = echoValue(type, rawValue, phone);
      break;
    }
    case "url": {
      analysis = await analyzeUrlTarget(rawValue);
      value = echoValue(type, rawValue);
      break;
    }
    case "upi": {
      analysis = await analyzeUpiTarget(rawValue);
      value = echoValue(type, rawValue, rawValue.trim().toLowerCase());
      break;
    }
    case "message": {
      analysis = await analyzeMessageTarget(rawValue);
      value = echoValue(type, rawValue);
      break;
    }
  }

  const signals = dedupeSignals(analysis.signals);
  const { score, riskLevel } = fuse(signals, analysis.couldAnalyze);

  let reasons = signals.filter((s) => s.severity !== "info").map((s) => s.label);
  if (reasons.length === 0) {
    reasons = [
      riskLevel === "unknown"
        ? "Not enough information to assess this target."
        : "No specific risk indicators found.",
    ];
  }

  return {
    type,
    value,
    riskLevel,
    score,
    category: analysis.category ?? null,
    confidence: analysis.confidence ?? null,
    reasons,
    signals,
  };
}
