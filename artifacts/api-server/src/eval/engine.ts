import type { FraudSignal, FraudVerdictRiskLevel } from "@workspace/api-zod";
import { normalizeIndianPhone } from "../lib/phone";
import { computeRiskLevel } from "../lib/reputation";
import { analyzeUrlHeuristics } from "../lib/url-analysis";
import { analyzeUpi } from "../lib/upi";
import { classifyMessage } from "../lib/ai-classifier";
import { SEED_CATEGORIES } from "../lib/seed";
import { extractEntities, fuse } from "../lib/fraud-engine";
import type { Example, Prediction, ReputationContext, ReputationMap } from "./types";

/**
 * The new multi-signal engine, exercised offline. It reuses the production
 * analyzers (`analyzeUrlHeuristics`, `analyzeUpi`, `computeRiskLevel`),
 * entity extraction, and the exact severity-weighted fusion from
 * `fraud-engine.ts`. Two differences from the live route, both made to keep the
 * harness deterministic and side-effect-free:
 *   1. Phone reputation comes from the dataset context, not the live DB.
 *   2. The external threat-feed (Safe Browsing) lookup is skipped — it is gated
 *      on an unset key in dev and only ever emits a zero-weight info signal.
 * The AI message classifier is opt-in (see `useAi`) so the default run is fully
 * reproducible; pass `--ai` to include the live model signal.
 */

const CATEGORIES = SEED_CATEGORIES.map((c) => ({ key: c.key, nameEn: c.nameEn }));
const NAME_BY_KEY = new Map(CATEGORIES.map((c) => [c.key, c.nameEn]));

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

function phoneSignals(rep: ReputationContext | undefined): {
  signals: FraudSignal[];
  hasData: boolean;
} {
  const reportCount = rep?.reportCount ?? 0;
  const verifiedScam = rep?.verifiedScam ?? false;
  const lastReportedAt =
    rep && rep.lastReportedDaysAgo != null
      ? new Date(Date.now() - rep.lastReportedDaysAgo * 24 * 60 * 60 * 1000)
      : null;
  const hasData = reportCount > 0 || verifiedScam;

  if (verifiedScam) {
    return {
      signals: [
        {
          source: "phone_reputation",
          severity: "high",
          label: "Confirmed scam number verified by KavachAI moderators.",
        },
      ],
      hasData: true,
    };
  }

  const level = computeRiskLevel({ verifiedScam, reportCount, lastReportedAt });
  const severity: FraudSignal["severity"] =
    level === "high" ? "high" : level === "medium" ? "medium" : level === "low" ? "low" : "info";
  const label =
    severity === "info"
      ? "No community reports yet for this number."
      : `Reported ${reportCount} time(s) by the community.`;
  return { signals: [{ source: "phone_reputation", severity, label }], hasData };
}

function urlSignals(raw: string): { signals: FraudSignal[]; couldAnalyze: boolean } {
  const { url, signals } = analyzeUrlHeuristics(raw);
  return { signals, couldAnalyze: url !== null };
}

function upiSignals(
  raw: string,
  repMap: ReputationMap,
): { signals: FraudSignal[]; couldAnalyze: boolean } {
  const { upiId, embeddedPhone, signals } = analyzeUpi(raw);
  if (!upiId) return { signals, couldAnalyze: false };
  if (embeddedPhone) {
    const normalized = normalizeIndianPhone(embeddedPhone);
    if (normalized) signals.push(...phoneSignals(repMap.get(normalized)).signals);
  }
  return { signals, couldAnalyze: true };
}

async function messageSignals(
  text: string,
  repMap: ReputationMap,
  useAi: boolean,
): Promise<{ signals: FraudSignal[]; couldAnalyze: boolean }> {
  const signals: FraudSignal[] = [];
  let couldAnalyze = false;

  const classification = useAi ? await classifyMessage(text, CATEGORIES) : null;
  if (classification) {
    couldAnalyze = true;
    if (classification.isScam) {
      const severity: FraudSignal["severity"] =
        classification.confidence >= 0.75
          ? "high"
          : classification.confidence >= 0.4
            ? "medium"
            : "low";
      const catName = classification.category
        ? NAME_BY_KEY.get(classification.category) ?? null
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

  const { urls, upis, phones } = extractEntities(text);
  for (const u of urls) {
    const r = urlSignals(u);
    if (r.couldAnalyze) couldAnalyze = true;
    signals.push(...r.signals);
  }
  for (const u of upis) {
    const r = upiSignals(u, repMap);
    if (r.couldAnalyze) couldAnalyze = true;
    signals.push(...r.signals);
  }
  for (const p of phones) {
    const normalized = normalizeIndianPhone(p);
    if (!normalized) continue;
    const r = phoneSignals(repMap.get(normalized));
    if (r.hasData) couldAnalyze = true;
    signals.push(...r.signals);
  }

  return { signals, couldAnalyze };
}

function toPrediction(signals: FraudSignal[], couldAnalyze: boolean): Prediction {
  const { riskLevel } = fuse(dedupeSignals(signals), couldAnalyze);
  return { riskLevel, flagged: riskLevel === "high" || riskLevel === "medium" };
}

export async function engineClassify(
  ex: Example,
  repMap: ReputationMap,
  useAi: boolean,
): Promise<Prediction> {
  switch (ex.type) {
    case "phone": {
      const normalized = normalizeIndianPhone(ex.value);
      if (!normalized) {
        const unknown: FraudVerdictRiskLevel = "unknown";
        return { riskLevel: unknown, flagged: false };
      }
      const rep = ex.reputation ?? repMap.get(normalized);
      const { signals, hasData } = phoneSignals(rep);
      return toPrediction(signals, hasData);
    }
    case "url": {
      const { signals, couldAnalyze } = urlSignals(ex.value);
      return toPrediction(signals, couldAnalyze);
    }
    case "upi": {
      const { signals, couldAnalyze } = upiSignals(ex.value, repMap);
      return toPrediction(signals, couldAnalyze);
    }
    case "message": {
      const { signals, couldAnalyze } = await messageSignals(ex.value, repMap, useAi);
      return toPrediction(signals, couldAnalyze);
    }
  }
}
