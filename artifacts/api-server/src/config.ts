import crypto from "node:crypto";
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

// Demo login for app store (Google Play) review. Reviewers can't receive an OTP
// on the demo SIM, so a single fixed, NON-admin account signs in with a phone +
// fixed passcode pair. Defaults to a clearly-fake number so it works out of the
// box; override with DEMO_LOGIN_PHONE. Defense-in-depth: if the demo number is
// ever an admin/owner phone the demo login is disabled (null), because the
// passcode lives in the store review notes and must never unlock a privileged
// account. Disable entirely by setting DEMO_LOGIN_OTP="".
const demoLoginPhoneRaw = normalizeIndianPhone(
  process.env.DEMO_LOGIN_PHONE ?? "9000000000",
);
const demoLoginPhone =
  demoLoginPhoneRaw &&
  !adminPhones.includes(demoLoginPhoneRaw) &&
  !superAdminPhonesEnv.includes(demoLoginPhoneRaw)
    ? demoLoginPhoneRaw
    : null;

function numEnv(name: string, fallback: number): number {
  const raw = process.env[name];
  if (!raw) return fallback;
  const parsed = Number(raw);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
}

/**
 * Whether the OTP-bypass test login (POST /auth/dev-login) is allowed. It is
 * fail-closed by design: it requires BOTH a non-production NODE_ENV AND an
 * explicit ENABLE_DEV_LOGIN="true" opt-in. A prod deployment that is merely
 * misconfigured (e.g. NODE_ENV unset, "staging", etc.) still keeps the route
 * disabled because the opt-in flag is absent. Read live (not cached) so it can
 * never be accidentally baked in and so it is unit-testable.
 */
export function isDevLoginEnabled(): boolean {
  return (
    process.env.NODE_ENV !== "production" &&
    process.env.ENABLE_DEV_LOGIN === "true"
  );
}

export const config = {
  isProduction,
  // Redis connection string. When set, the rate limiter uses Redis so limits
  // are shared across every API instance — required before scaling the API to
  // more than one instance. Unset = per-process in-memory limiter (dev / single
  // instance). Use a rediss:// URL for TLS (e.g. DigitalOcean Managed Valkey).
  redisUrl: (process.env.REDIS_URL ?? "").trim(),
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
  // Per-IP throttle for the development-only test login (see isDevLoginEnabled).
  devLoginMaxPerIpPerMinute: intEnv("DEV_LOGIN_MAX_PER_IP_PER_MINUTE", 10),
  // Demo login for app store (Google Play) review. See demoLoginPhone above:
  // resolved/guarded earlier so a privileged number can never be used here.
  demoLoginPhone,
  demoLoginOtp: (process.env.DEMO_LOGIN_OTP ?? "7019").trim(),
  demoLoginMaxPerIpPerMinute: intEnv("DEMO_LOGIN_MAX_PER_IP_PER_MINUTE", 10),
  sessionTtlDays: intEnv("SESSION_TTL_DAYS", 60),
  reportDuplicateWindowHours: intEnv("REPORT_DUPLICATE_WINDOW_HOURS", 24),
  reportMaxPerHour: intEnv("REPORT_MAX_PER_HOUR", 20),
  // Login-free proof-of-work bot check on the anonymous public report endpoint.
  // The challenge is HMAC-signed with `botCheckSecret` so it can't be forged or
  // tampered with. `botCheckDifficulty` is the number of leading hex zeros the
  // client's sha256(challenge.solution) must have — 4 ≈ 65k hashes, well under a
  // second in a browser, but costly to farm at scale. Set BOT_CHECK_SECRET in
  // production so challenges issued by one API instance verify on another; when
  // unset it falls back to a per-process random secret (fine for single
  // instance / dev).
  botCheckSecret:
    (process.env.BOT_CHECK_SECRET ?? "").trim() ||
    crypto.randomBytes(32).toString("hex"),
  botCheckDifficulty: intEnv("BOT_CHECK_DIFFICULTY", 4),
  botCheckTtlMs: intEnv("BOT_CHECK_TTL_MS", 5 * 60 * 1000),
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
