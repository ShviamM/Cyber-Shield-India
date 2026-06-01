import { describe, expect, it } from "vitest";
import { runFraudCheck } from "../lib/fraud-engine";
import { engineClassify } from "./engine";
import type { Example, ReputationMap } from "./types";

/**
 * Guards against drift between the offline harness adapter and the production
 * engine for the code paths that touch neither the DB nor the AI model (URL and
 * UPI without an embedded phone). If the engine's fusion or analyzers change,
 * the adapter must produce the same riskLevel — or this test fails.
 */
const emptyRep: ReputationMap = new Map();

const URL_CASES = [
  "http://203.0.113.45/",
  "http://hdfc-rewards.xyz",
  "https://xn--pple-43d.com",
  "https://bit.ly/3xK9zQ",
  "https://www.google.com",
  "https://accounts.google.com/signin",
  "https://www.icicibank.com/personal/login",
];

const UPI_CASES = ["scammer123@randomxyz", "merchant@oksbi", "somebiz@fbl"];

describe("engine adapter parity with runFraudCheck", () => {
  it.each(URL_CASES)("matches riskLevel for url %s", async (value) => {
    const ex: Example = { id: "t", type: "url", value, label: "scam" };
    const adapter = await engineClassify(ex, emptyRep, false);
    const real = await runFraudCheck("url", value);
    expect(adapter.riskLevel).toBe(real.riskLevel);
  });

  it.each(UPI_CASES)("matches riskLevel for upi %s", async (value) => {
    const ex: Example = { id: "t", type: "upi", value, label: "scam" };
    const adapter = await engineClassify(ex, emptyRep, false);
    const real = await runFraudCheck("upi", value);
    expect(adapter.riskLevel).toBe(real.riskLevel);
  });
});
