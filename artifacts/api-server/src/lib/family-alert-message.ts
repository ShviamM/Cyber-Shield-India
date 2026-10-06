/**
 * Pure helpers for Family Guardian alerts, kept free of the database so they can
 * be unit-tested.
 */

/** Only community-flagged callers alert a guardian; "low"/"unknown" never do. */
export function isAlertableRisk(riskLevel: string): riskLevel is "high" | "medium" {
  return riskLevel === "high" || riskLevel === "medium";
}

/** "+919876543210" -> "+91 98765 43210"; anything else is returned unchanged. */
export function formatPhoneForAlert(phone: string): string {
  const m = /^\+91(\d{5})(\d{5})$/.exec(phone);
  return m ? `+91 ${m[1]} ${m[2]}` : phone;
}

function prettyCategory(key: string | null): string | null {
  if (!key || !key.trim()) return null;
  return key
    .split(/[_\-\s]+/)
    .filter(Boolean)
    .map((w) => w.toLowerCase())
    .join(" ");
}

/** Push title and body for the guardian's phone. */
export function buildFamilyAlertMessage(opts: {
  memberName: string;
  callerPhone: string;
  riskLevel: "high" | "medium";
  reportCount: number;
  category: string | null;
}): { title: string; body: string } {
  const name = opts.memberName.trim() || "Your family member";
  const caller = formatPhoneForAlert(opts.callerPhone);
  const category = prettyCategory(opts.category);
  const title =
    opts.riskLevel === "high"
      ? `${name} is getting a call from a reported scam number`
      : `${name} is getting a call from a suspicious number`;
  const reports =
    opts.reportCount === 1 ? "1 report" : `${opts.reportCount} reports`;
  const what = category ? `${caller} (${category}, ${reports})` : `${caller} (${reports})`;
  return {
    title,
    body: `${what}. Call ${name} now and remind them never to share an OTP or send money.`,
  };
}
