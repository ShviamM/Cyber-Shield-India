import { describe, expect, it } from "vitest";
import { metricsFrom } from "./metrics";
import { scoreDataset } from "./run";

/**
 * Accuracy-regression guard. Runs the evaluation harness deterministically
 * (no AI, no DB, no network — see `scoreDataset`) and fails if the engine's
 * overall F1 or accuracy drops below the agreed baseline. This turns the
 * offline harness into an automated check, so a future engine change that
 * makes detection worse is caught here instead of shipping silently.
 *
 * BASELINE — raise these intentionally as the engine (or dataset) improves;
 * never lower them to make a failing run pass.
 *   - The task that introduced this guard quoted F1 81.3% / accuracy 83.3%.
 *   - The benchmark dataset has since been strengthened, lifting the
 *     deterministic engine to F1 88.235% / accuracy 88.889%, which is the real
 *     floor we now defend. A single new misclassification moves these metrics
 *     by ~2-3 points, so any genuine regression trips the check while the small
 *     buffer below keeps the assertion stable against floating-point noise.
 */
const BASELINE = {
  f1: 0.882,
  accuracy: 0.888,
} as const;

describe("fraud engine accuracy regression guard", () => {
  it("keeps overall F1 and accuracy at or above baseline", async () => {
    const { engine } = await scoreDataset(false);
    const m = metricsFrom(engine.overall);

    expect(
      m.f1,
      `engine F1 ${(m.f1 * 100).toFixed(1)}% dropped below baseline ${(BASELINE.f1 * 100).toFixed(1)}%`,
    ).toBeGreaterThanOrEqual(BASELINE.f1);

    expect(
      m.accuracy,
      `engine accuracy ${(m.accuracy * 100).toFixed(1)}% dropped below baseline ${(BASELINE.accuracy * 100).toFixed(1)}%`,
    ).toBeGreaterThanOrEqual(BASELINE.accuracy);
  });
});
