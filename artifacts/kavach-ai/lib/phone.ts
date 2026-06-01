/**
 * Client-side Indian mobile number helpers.
 * The backend is the source of truth for normalization; these mirror its
 * rules so the UI can validate early and display numbers consistently.
 */

/** Extract just the 10 significant digits from any common Indian format. */
export function tenDigits(raw: string | null | undefined): string | null {
  if (!raw) return null;
  let digits = raw.replace(/\D/g, "");
  if (digits.length === 12 && digits.startsWith("91")) digits = digits.slice(2);
  else if (digits.length === 11 && digits.startsWith("0")) digits = digits.slice(1);
  if (digits.length !== 10) return null;
  if (!/^[6-9]/.test(digits)) return null;
  return digits;
}

/** True when the input is a valid 10-digit Indian mobile number. */
export function isValidIndianPhone(raw: string | null | undefined): boolean {
  return tenDigits(raw) !== null;
}

/** Normalize to E.164 (+91XXXXXXXXXX) or null when invalid. */
export function normalizeIndianPhone(raw: string | null | undefined): string | null {
  const d = tenDigits(raw);
  return d ? `+91${d}` : null;
}

/**
 * Value to use as the `:phone` path segment for backend calls.
 * Sends plain digits to avoid encoding issues with `+` in URLs; the
 * backend normalizes any common format.
 */
export function phoneForApi(raw: string | null | undefined): string | null {
  return tenDigits(raw);
}

/** Human-friendly display: +91 98765 43210. Falls back to the raw input. */
export function formatIndianPhone(raw: string | null | undefined): string {
  const d = tenDigits(raw);
  if (!d) return (raw ?? "").trim();
  return `+91 ${d.slice(0, 5)} ${d.slice(5)}`;
}
