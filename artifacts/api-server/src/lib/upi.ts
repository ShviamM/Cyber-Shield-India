import type { FraudSignal } from "@workspace/api-zod";

// Well-known UPI PSP handles (suffix after the @). Not exhaustive, but covers
// the major providers; an unknown handle is a mild signal, not proof of fraud.
const KNOWN_HANDLES = new Set([
  "oksbi",
  "okhdfcbank",
  "okicici",
  "okaxis",
  "ybl",
  "ibl",
  "axl",
  "paytm",
  "apl",
  "upi",
  "okbizaxis",
  "sbi",
  "hdfcbank",
  "icici",
  "axisbank",
  "kotak",
  "pnb",
  "barodampay",
  "fbl",
  "idfcbank",
  "yespay",
  "rbl",
  "airtel",
  "freecharge",
  "jupiteraxis",
  "fam",
  "naviaxis",
  "slc",
  "waaxis",
  "yapl",
]);

const UPI_RE = /^[a-z0-9.\-_]{2,256}@[a-z]{2,64}$/i;

export type UpiAnalysis = {
  /** Lowercased, validated UPI id, or null when malformed. */
  upiId: string | null;
  /** A 10-digit phone embedded in the prefix, if any (e.g. 9876543210@ybl). */
  embeddedPhone: string | null;
  signals: FraudSignal[];
};

/**
 * Canonical key for community UPI reputation: the lowercased, validated VPA, or
 * null when malformed. Report-time and check-time use this so lookups agree.
 */
export function normalizeUpiKey(raw: string): string | null {
  const value = raw.trim().toLowerCase();
  return UPI_RE.test(value) ? value : null;
}

export function analyzeUpi(raw: string): UpiAnalysis {
  const value = raw.trim().toLowerCase();
  const signals: FraudSignal[] = [];
  const sig = (severity: FraudSignal["severity"], label: string) =>
    signals.push({ source: "upi_heuristic", severity, label });

  if (!UPI_RE.test(value)) {
    sig("info", "Not a valid UPI ID format (expected name@bank).");
    return { upiId: null, embeddedPhone: null, signals };
  }

  const [prefix, handle] = value.split("@");

  if (!KNOWN_HANDLES.has(handle)) {
    sig("low", `Payment handle "@${handle}" is not a widely recognized UPI provider.`);
  }

  // A purely numeric prefix is often a phone-linked VPA; pull it out so the
  // engine can also weigh that number's community reputation.
  let embeddedPhone: string | null = null;
  const digitsOnly = prefix.replace(/\D/g, "");
  if (/^[6-9]\d{9}$/.test(prefix)) {
    embeddedPhone = prefix;
  } else if (digitsOnly.length >= 10) {
    const tail = digitsOnly.slice(-10);
    if (/^[6-9]\d{9}$/.test(tail)) embeddedPhone = tail;
  }

  return { upiId: value, embeddedPhone, signals };
}
