import crypto from "node:crypto";
import { describe, expect, it } from "vitest";
import { config } from "../config";
import { issueChallenge, verifyProofOfWork } from "./proof-of-work";

/** Brute-forces a valid solution the same way the browser client does. */
function solve(challenge: string, difficulty: number): string {
  const prefix = "0".repeat(difficulty);
  for (let n = 0; n < 50_000_000; n++) {
    const solution = String(n);
    const hash = crypto
      .createHash("sha256")
      .update(`${challenge}.${solution}`)
      .digest("hex");
    if (hash.startsWith(prefix)) return solution;
  }
  throw new Error("no solution found");
}

describe("verifyProofOfWork", () => {
  it("accepts a correctly solved challenge", () => {
    const c = issueChallenge();
    const solution = solve(c.challenge, c.difficulty);
    expect(verifyProofOfWork({ ...c, solution })).toEqual({
      ok: true,
      challenge: c.challenge,
    });
  });

  it("rejects when fields are missing", () => {
    expect(verifyProofOfWork({}).ok).toBe(false);
    const c = issueChallenge();
    expect(verifyProofOfWork({ ...c }).ok).toBe(false); // no solution
  });

  it("rejects a tampered difficulty (signature won't match)", () => {
    const c = issueChallenge();
    const solution = solve(c.challenge, c.difficulty);
    // Lowering difficulty to make a trivial solution pass must fail the HMAC.
    const tampered = verifyProofOfWork({ ...c, difficulty: 1, solution });
    expect(tampered).toEqual({ ok: false, reason: "bad_signature" });
  });

  it("rejects a forged signature", () => {
    const c = issueChallenge();
    const solution = solve(c.challenge, c.difficulty);
    const res = verifyProofOfWork({ ...c, signature: "deadbeef", solution });
    expect(res).toEqual({ ok: false, reason: "bad_signature" });
  });

  it("rejects an expired challenge", () => {
    const c = issueChallenge();
    const solution = solve(c.challenge, c.difficulty);
    const expiredAt = Date.now() - 1000;
    // Re-sign with the past expiry so only the expiry check (not the signature)
    // is what rejects it.
    const signature = crypto
      .createHmac("sha256", config.botCheckSecret)
      .update(`${c.challenge}.${expiredAt}.${c.difficulty}`)
      .digest("hex");
    const res = verifyProofOfWork({
      challenge: c.challenge,
      expiresAt: expiredAt,
      difficulty: c.difficulty,
      signature,
      solution,
    });
    expect(res).toEqual({ ok: false, reason: "expired" });
  });

  it("rejects an incorrect solution", () => {
    const c = issueChallenge();
    const res = verifyProofOfWork({ ...c, solution: "definitely-not-it" });
    expect(res).toEqual({ ok: false, reason: "bad_solution" });
  });
});
