import type { Label } from "./types";

export interface Confusion {
  truePositive: number;
  falsePositive: number;
  trueNegative: number;
  falseNegative: number;
}

export interface Metrics extends Confusion {
  total: number;
  precision: number;
  recall: number;
  f1: number;
  accuracy: number;
}

export function emptyConfusion(): Confusion {
  return { truePositive: 0, falsePositive: 0, trueNegative: 0, falseNegative: 0 };
}

/** Accumulate one labeled prediction. Positive class = "scam". */
export function tally(c: Confusion, actual: Label, flagged: boolean): void {
  const positive = actual === "scam";
  if (positive && flagged) c.truePositive++;
  else if (!positive && flagged) c.falsePositive++;
  else if (!positive && !flagged) c.trueNegative++;
  else c.falseNegative++;
}

function safeDiv(num: number, den: number): number {
  return den === 0 ? 0 : num / den;
}

export function metricsFrom(c: Confusion): Metrics {
  const { truePositive: tp, falsePositive: fp, trueNegative: tn, falseNegative: fn } = c;
  const total = tp + fp + tn + fn;
  const precision = safeDiv(tp, tp + fp);
  const recall = safeDiv(tp, tp + fn);
  const f1 = safeDiv(2 * precision * recall, precision + recall);
  const accuracy = safeDiv(tp + tn, total);
  return { ...c, total, precision, recall, f1, accuracy };
}
