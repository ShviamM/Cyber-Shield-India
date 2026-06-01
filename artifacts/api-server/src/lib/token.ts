import crypto from "node:crypto";

/** Generate an opaque, unguessable session token. */
export function generateToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

/** Hash a session token for storage; only the hash is persisted. */
export function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}
