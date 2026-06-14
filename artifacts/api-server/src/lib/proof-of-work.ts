/**
 * Self-contained proof-of-work bot check for the anonymous public report
 * endpoint. There is no account to throttle against, so on top of the per-IP
 * rate limits we require the client to solve a small computational puzzle that
 * is cheap for a single honest visitor but expensive to farm at scale (even
 * across rotating IPs).
 *
 * The challenge is HMAC-signed with a server secret so a client cannot forge
 * one or tamper with its difficulty/expiry. Verification recomputes the
 * signature and checks that sha256(`challenge.solution`) has the required
 * number of leading hex zeros. Replay (reusing one solved challenge for many
 * reports) is guarded separately by the caller via the one-time rate-limit key.
 */
import crypto from "node:crypto";
import { config } from "../config";

export type BotCheckChallenge = {
  challenge: string;
  expiresAt: number;
  difficulty: number;
  signature: string;
};

function sign(challenge: string, expiresAt: number, difficulty: number): string {
  return crypto
    .createHmac("sha256", config.botCheckSecret)
    .update(`${challenge}.${expiresAt}.${difficulty}`)
    .digest("hex");
}

/** Mints a fresh, short-lived, signed challenge. */
export function issueChallenge(): BotCheckChallenge {
  const challenge = crypto.randomBytes(16).toString("hex");
  const expiresAt = Date.now() + config.botCheckTtlMs;
  const difficulty = config.botCheckDifficulty;
  return { challenge, expiresAt, difficulty, signature: sign(challenge, expiresAt, difficulty) };
}

function hasLeadingZeros(hash: string, difficulty: number): boolean {
  for (let i = 0; i < difficulty; i++) {
    if (hash[i] !== "0") return false;
  }
  return true;
}

export type PowInput = {
  challenge?: unknown;
  expiresAt?: unknown;
  difficulty?: unknown;
  signature?: unknown;
  solution?: unknown;
};

export type PowVerification =
  | { ok: true; challenge: string }
  | { ok: false; reason: "missing" | "expired" | "bad_signature" | "bad_solution" };

/**
 * Verifies a submitted solution. Checks (in order): all fields present, the
 * signature matches (so difficulty/expiry can't be tampered with), the
 * challenge has not expired, and the solution actually meets the difficulty.
 */
export function verifyProofOfWork(input: PowInput): PowVerification {
  const { challenge, expiresAt, difficulty, signature, solution } = input;
  if (
    typeof challenge !== "string" ||
    typeof expiresAt !== "number" ||
    !Number.isFinite(expiresAt) ||
    typeof difficulty !== "number" ||
    !Number.isInteger(difficulty) ||
    difficulty < 1 ||
    typeof signature !== "string" ||
    typeof solution !== "string" ||
    challenge.length === 0 ||
    signature.length === 0 ||
    solution.length === 0
  ) {
    return { ok: false, reason: "missing" };
  }

  const expected = sign(challenge, expiresAt, difficulty);
  const a = Buffer.from(expected);
  const b = Buffer.from(signature);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
    return { ok: false, reason: "bad_signature" };
  }

  if (Date.now() > expiresAt) {
    return { ok: false, reason: "expired" };
  }

  const hash = crypto
    .createHash("sha256")
    .update(`${challenge}.${solution}`)
    .digest("hex");
  if (!hasLeadingZeros(hash, difficulty)) {
    return { ok: false, reason: "bad_solution" };
  }

  return { ok: true, challenge };
}
