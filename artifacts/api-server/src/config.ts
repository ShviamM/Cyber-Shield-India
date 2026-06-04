import { normalizeIndianPhone } from "./lib/phone";

export const isProduction = process.env.NODE_ENV === "production";

function intEnv(name: string, fallback: number): number {
  const raw = process.env[name];
  if (!raw) return fallback;
  const parsed = Number(raw);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

export const config = {
  isProduction,
  // MSG91 OTP Widget. The widget (client-side RN SDK) sends and verifies the
  // OTP on MSG91's side and returns an access token; the backend validates that
  // token with MSG91's verifyAccessToken API. `msg91AuthKey` is the account
  // auth key (server-side only); `msg91WidgetId` is the public widget id.
  msg91AuthKey: (process.env.MSG91_AUTH_KEY ?? "").trim(),
  msg91WidgetId: (process.env.MSG91_WIDGET_ID ?? "").trim(),
  // Per-IP throttles on the auth endpoints (cost/abuse protection): stop one
  // client from probing many phone numbers or replaying tokens.
  otpRequestMaxPerIpPerHour: intEnv("OTP_REQUEST_MAX_PER_IP_PER_HOUR", 30),
  otpVerifyMaxPerIpPerMinute: intEnv("OTP_VERIFY_MAX_PER_IP_PER_MINUTE", 10),
  sessionTtlDays: intEnv("SESSION_TTL_DAYS", 60),
  reportDuplicateWindowHours: intEnv("REPORT_DUPLICATE_WINDOW_HOURS", 24),
  reportMaxPerHour: intEnv("REPORT_MAX_PER_HOUR", 20),
  // Multi-signal fraud check: per-client rate limit (the engine may call the AI
  // model and an external threat feed, so this protects cost and abuse).
  fraudCheckMaxPerMinute: intEnv("FRAUD_CHECK_MAX_PER_MINUTE", 20),
  // Optional Google Safe Browsing API key. When unset, URL checks fall back to
  // structural heuristics only (explicitly noted in the verdict).
  safeBrowsingApiKey: (process.env.GOOGLE_SAFE_BROWSING_API_KEY ?? "").trim(),
  adminPhones: (process.env.ADMIN_PHONES ?? "")
    .split(",")
    .map((p) => normalizeIndianPhone(p.trim()))
    .filter((p): p is string => Boolean(p)),
};
