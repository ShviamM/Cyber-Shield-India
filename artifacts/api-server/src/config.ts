import { normalizeIndianPhone } from "./lib/phone";

export const isProduction = process.env.NODE_ENV === "production";

function intEnv(name: string, fallback: number): number {
  const raw = process.env[name];
  if (!raw) return fallback;
  const parsed = Number(raw);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

// SMS provider for OTP delivery. Defaults to Twilio in production and the dev
// mock otherwise. Set SMS_PROVIDER=twilio to test real SMS in development.
const smsProvider = (process.env.SMS_PROVIDER ?? (isProduction ? "twilio" : "mock"))
  .trim()
  .toLowerCase();

export const config = {
  isProduction,
  smsProvider,
  otpTtlSeconds: intEnv("OTP_TTL_SECONDS", 300),
  otpMaxAttempts: intEnv("OTP_MAX_ATTEMPTS", 5),
  otpResendIntervalSeconds: intEnv("OTP_RESEND_INTERVAL_SECONDS", 30),
  otpMaxPerHour: intEnv("OTP_MAX_PER_HOUR", 5),
  sessionTtlDays: intEnv("SESSION_TTL_DAYS", 60),
  reportDuplicateWindowHours: intEnv("REPORT_DUPLICATE_WINDOW_HOURS", 24),
  reportMaxPerHour: intEnv("REPORT_MAX_PER_HOUR", 20),
  adminPhones: (process.env.ADMIN_PHONES ?? "")
    .split(",")
    .map((p) => normalizeIndianPhone(p.trim()))
    .filter((p): p is string => Boolean(p)),
};
