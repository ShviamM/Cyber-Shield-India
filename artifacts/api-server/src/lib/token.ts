import crypto from "node:crypto";

/** Generate an opaque, unguessable session token. */
export function generateToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

/** Hash a session token for storage; only the hash is persisted. */
export function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

/**
 * Constant-time string comparison. Both inputs are SHA-256 hashed first so the
 * compared buffers are always equal length (avoids leaking length) and the
 * comparison itself doesn't short-circuit on the first differing byte.
 */
export function safeCompare(a: string, b: string): boolean {
  const ah = crypto.createHash("sha256").update(a).digest();
  const bh = crypto.createHash("sha256").update(b).digest();
  return crypto.timingSafeEqual(ah, bh);
}
