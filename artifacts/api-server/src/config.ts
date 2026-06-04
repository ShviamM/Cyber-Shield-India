import { normalizeIndianPhone } from "./lib/phone";

export const isProduction = process.env.NODE_ENV === "production";

function intEnv(name: string, fallback: number): number {
  const raw = process.env[name];
  if (!raw) return fallback;
  const parsed = Number(raw);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

// SMS provider for OTP delivery. Defaults to MSG91 in production and the dev
// mock otherwise. Set SMS_PROVIDER=msg91 to test real SMS in development.
const smsProvider = (process.env.SMS_PROVIDER ?? (isProduction ? "msg91" : "mock"))
  .trim()
  .toLowerCase();

export const config = {
  isProduction,
  smsProvider,
  // MSG91 credentials for OTP delivery via the MSG91 Flow API. The auth key and
  // a DLT-approved template id are required; the sender id is optional (usually
  // baked into the template). `msg91OtpVar` is the variable name used inside the
  // template to inject the code (defaults to "OTP").
  msg91AuthKey: (process.env.MSG91_AUTH_KEY ?? "").trim(),
  msg91TemplateId: (process.env.MSG91_TEMPLATE_ID ?? "").trim(),
  msg91SenderId: (process.env.MSG91_SENDER_ID ?? "").trim(),
  msg91OtpVar: (process.env.MSG91_OTP_VAR ?? "OTP").trim(),
  otpTtlSeconds: intEnv("OTP_TTL_SECONDS", 300),
  otpMaxAttempts: intEnv("OTP_MAX_ATTEMPTS", 5),
  otpResendIntervalSeconds: intEnv("OTP_RESEND_INTERVAL_SECONDS", 30),
  otpMaxPerHour: intEnv("OTP_MAX_PER_HOUR", 5),
  // Per-IP throttles on the OTP endpoints (cost/abuse protection layered on top
  // of the per-phone caps): stops one client from spraying many phone numbers.
  otpRequestMaxPerIpPerHour: intEnv("OTP_REQUEST_MAX_PER_IP_PER_HOUR", 10),
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
