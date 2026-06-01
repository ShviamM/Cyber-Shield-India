import crypto from "node:crypto";

/** Generate a zero-padded 6-digit numeric OTP. */
export function generateOtp(): string {
  return crypto.randomInt(0, 1_000_000).toString().padStart(6, "0");
}

/** Hash an OTP bound to its phone number so codes are never stored in plaintext. */
export function hashOtp(phone: string, code: string): string {
  return crypto.createHash("sha256").update(`${phone}:${code}`).digest("hex");
}
