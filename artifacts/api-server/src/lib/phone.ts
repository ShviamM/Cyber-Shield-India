/**
 * Normalize an Indian mobile number to E.164 (+91XXXXXXXXXX).
 * Accepts common formats: 10-digit, 0-prefixed, 91-prefixed, +91, spaces/dashes.
 * Returns null when the input is not a valid Indian mobile number
 * (10 digits starting with 6-9).
 */
export function normalizeIndianPhone(raw: string | null | undefined): string | null {
  if (!raw) return null;
  let digits = raw.replace(/\D/g, "");

  if (digits.length === 13 && digits.startsWith("091")) {
    digits = digits.slice(3);
  } else if (digits.length === 12 && digits.startsWith("91")) {
    digits = digits.slice(2);
  } else if (digits.length === 11 && digits.startsWith("0")) {
    digits = digits.slice(1);
  }

  if (!/^[6-9]\d{9}$/.test(digits)) return null;
  return `+91${digits}`;
}
