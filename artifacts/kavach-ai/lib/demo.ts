// Demo account used by app store (Google Play) reviewers to sign in without a
// real SIM/OTP. Kept in sync with the backend DEMO_LOGIN_PHONE (api-server
// config). The account is a normal, non-admin user; we unlock Premium for it
// on the client so reviewers can see every feature (premium is gated via the
// RevenueCat entitlement, which the demo device won't have).
export const DEMO_LOGIN_PHONE = "+919000000000";

function last10(phone: string | null | undefined): string {
  return (phone ?? "").replace(/\D/g, "").slice(-10);
}

/** True when the given phone number is the demo (app-store-review) account. */
export function isDemoPhone(phone: string | null | undefined): boolean {
  const digits = last10(phone);
  return digits.length === 10 && digits === last10(DEMO_LOGIN_PHONE);
}
