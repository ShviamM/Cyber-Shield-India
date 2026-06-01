import type { FraudVerdictRiskLevel } from "@workspace/api-zod";

export type Label = "scam" | "legit";
export type ExampleType = "phone" | "url" | "upi" | "message";

/**
 * Community-reputation context for a phone number. Phone risk is not an
 * intrinsic property of the digits — it depends on how often the number has
 * been reported. To keep the harness deterministic and DB-free, the dataset
 * carries this context inline (instead of seeding the live reputation table).
 */
export interface ReputationContext {
  reportCount: number;
  verifiedScam: boolean;
  /** Days since the last report, or null when never reported. */
  lastReportedDaysAgo: number | null;
}

export interface Example {
  id: string;
  type: ExampleType;
  value: string;
  label: Label;
  note?: string;
  /** Present on `phone` examples; reused when the number is embedded elsewhere. */
  reputation?: ReputationContext;
}

/** A classifier's output for a single example. */
export interface Prediction {
  riskLevel: FraudVerdictRiskLevel;
  /** True when the classifier treats this as a scam (medium or high risk). */
  flagged: boolean;
}

/** Maps a normalized E.164 phone number to its reputation context. */
export type ReputationMap = Map<string, ReputationContext>;
