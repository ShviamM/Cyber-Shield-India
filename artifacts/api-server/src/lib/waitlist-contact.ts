import { normalizeIndianPhone } from "./phone";

export type WaitlistContact = { contact: string; contactType: "email" | "phone" };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Accept an email address or an Indian mobile number; null when neither. */
export function parseWaitlistContact(raw: unknown): WaitlistContact | null {
  if (typeof raw !== "string") return null;
  const value = raw.trim();
  if (!value || value.length > 254) return null;
  if (value.includes("@")) {
    return EMAIL_RE.test(value) ? { contact: value.toLowerCase(), contactType: "email" } : null;
  }
  const phone = normalizeIndianPhone(value);
  return phone ? { contact: phone, contactType: "phone" } : null;
}
