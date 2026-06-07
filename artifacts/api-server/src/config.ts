import { normalizeIndianPhone } from "./lib/phone";

export const isProduction = process.env.NODE_ENV === "production";

function intEnv(name: string, fallback: number): number {
  const raw = process.env[name];
  if (!raw) return fallback;
  const parsed = Number(raw);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

const adminPhones = (process.env.ADMIN_PHONES ?? "")
  .split(",")
  .map((p) => normalizeIndianPhone(p.trim()))
  .filter((p): p is string => Boolean(p));

// Platform owners who may see the Super Admin (cost/infra) dashboard. Defaults
// to the admin accounts when SUPER_ADMIN_PHONES is unset, so the owner gets
// access out of the box; set it to restrict the dashboard to a subset.
const superAdminPhonesEnv = (process.env.SUPER_ADMIN_PHONES ?? "")
  .split(",")
  .map((p) => normalizeIndianPhone(p.trim()))
  .filter((p): p is string => Boolean(p));

function numEnv(name: string, fallback: number): number {
  const raw = process.env[name];
  if (!raw) return fallback;
  const parsed = Number(raw);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
}

export const config = {
  isProduction,
  // MSG91 OTP Widget. The widget (client-side RN SDK) sends and verifies the
  // OTP on MSG91's side and returns an access token; the backend validates that
  // token with MSG91's verifyAccessToken API. `msg91AuthKey` is the account
  // auth key (server-side only); `msg91WidgetId` is the public widget id.
  msg91AuthKey: (process.env.MSG91_AUTH_KEY ?? "").trim(),
  msg91WidgetId: (process.env.MSG91_WIDGET_ID ?? "").trim(),
  // The mobile app and the website use SEPARATE MSG91 widgets: the mobile widget
  // has "Mobile Integration" ON (required by the RN SDK), which makes MSG91 reject
  // web requests; the website therefore needs its own widget with that toggle OFF.
  // verifyAccessToken validates a token against a specific widgetId, so the backend
  // must try every configured widget. This is the optional web widget id.
  msg91WebWidgetId: (process.env.MSG91_WEB_WIDGET_ID ?? "").trim(),
  // Single shared password for the admin web console (password-only login).
  // Server-side only; never sent to clients.
  adminPassword: (process.env.ADMIN_PASSWORD ?? "").trim(),
  // Per-IP throttles on the auth endpoints (cost/abuse protection): stop one
  // client from probing many phone numbers or replaying tokens.
  otpRequestMaxPerIpPerHour: intEnv("OTP_REQUEST_MAX_PER_IP_PER_HOUR", 30),
  otpVerifyMaxPerIpPerMinute: intEnv("OTP_VERIFY_MAX_PER_IP_PER_MINUTE", 10),
  // Admin console login is a single-factor, single shared-credential entrypoint,
  // so it gets its own stricter brute-force throttles (independent of OTP tuning):
  // a tight per-minute cap plus a longer rolling per-hour cap.
  adminLoginMaxPerIpPerMinute: intEnv("ADMIN_LOGIN_MAX_PER_IP_PER_MINUTE", 5),
  adminLoginMaxPerIpPerHour: intEnv("ADMIN_LOGIN_MAX_PER_IP_PER_HOUR", 30),
  sessionTtlDays: intEnv("SESSION_TTL_DAYS", 60),
  reportDuplicateWindowHours: intEnv("REPORT_DUPLICATE_WINDOW_HOURS", 24),
  reportMaxPerHour: intEnv("REPORT_MAX_PER_HOUR", 20),
  // Multi-signal fraud check: per-client rate limit (the engine may call the AI
  // model and an external threat feed, so this protects cost and abuse).
  fraudCheckMaxPerMinute: intEnv("FRAUD_CHECK_MAX_PER_MINUTE", 20),
  // Paid plans advertise "priority" fraud checks: authenticated premium users
  // get a higher per-minute budget on /check than anonymous/free clients.
  fraudCheckPremiumMaxPerMinute: intEnv(
    "FRAUD_CHECK_PREMIUM_MAX_PER_MINUTE",
    60,
  ),
  // Optional Google Safe Browsing API key. When unset, URL checks fall back to
  // structural heuristics only (explicitly noted in the verdict).
  safeBrowsingApiKey: (process.env.GOOGLE_SAFE_BROWSING_API_KEY ?? "").trim(),
  adminPhones,
  // Platform owners allowed into the Super Admin dashboard. Falls back to the
  // admin accounts when unset.
  superAdminPhones: superAdminPhonesEnv.length
    ? superAdminPhonesEnv
    : adminPhones,
  // Estimated AI pricing (USD per 1M tokens) used to turn recorded token usage
  // into a cost figure on the Super Admin dashboard. Defaults approximate
  // gpt-5-mini; override per current provider pricing.
  aiInputUsdPerMillionTokens: numEnv("AI_INPUT_USD_PER_MTOK", 0.25),
  aiOutputUsdPerMillionTokens: numEnv("AI_OUTPUT_USD_PER_MTOK", 2),
  // Browser origins allowed to call the API (the admin web console). Mobile and
  // native clients send no Origin header and are always allowed (see app.ts).
  // The Replit preview/deploy domains are auto-allowed so the console works
  // without extra configuration; set ADMIN_ORIGINS to lock to a custom domain.
  allowedOrigins: [
    ...(process.env.ADMIN_ORIGINS ?? "")
      .split(",")
      .map((o) => o.trim())
      .filter(Boolean),
    ...(process.env.REPLIT_DOMAINS ?? "")
      .split(",")
      .map((d) => d.trim())
      .filter(Boolean)
      .map((d) => `https://${d}`),
  ],
};
