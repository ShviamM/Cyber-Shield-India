# Netraksh — Developer Handoff

**Prepared:** 08 June 2026
**Purpose:** Everything a new developer needs to take ownership of Netraksh — what works, what is deployed, how to run/build/deploy it, the secrets required, and the known open issues.

This document is a map. Three companion docs hold the detail and are part of this repo:

- **`DEPLOYMENT.md`** — step-by-step deploy guide (Docker, DigitalOcean App Platform, EAS mobile builds).
- **`NETRAKSH_PRELAUNCH_AUDIT.md`** — deep pre-launch audit (security, payments, AI, Play Store readiness, ranked improvements).
- **`replit.md`** — project conventions, gotchas, and the `pnpm-workspace` pointer.

---

## 1. What Netraksh is

Netraksh ("India's Digital Bodyguard", tagline *"Thag se 2 kadam aage"*) is an AI-powered fraud-prevention product for Indian consumers. A user can instantly check whether a **phone number, SMS/WhatsApp message, link, UPI ID, or QR code** is a scam, gets real-time call/SMS screening ("Guardian") on Android, a community fraud-report feed, city-level scam hotspots, and a family-safety shield. Monetized via subscriptions (Free / Premium / Family).

---

## 2. Repository map (pnpm monorepo, Node 24, TypeScript 5.9)

```
artifacts/
  website/      React + Vite + Wouter — marketing site + user account/billing (Razorpay).   → deployed
  admin/        React + Vite + Wouter — moderation, KPIs, fraud map, broadcasts, super-admin. → deployed
  kavach-ai/    Expo (React Native) — the mobile app. Technical IDs stay "kavach-ai".          → ships via EAS
  api-server/   Express 5 — the single backend all clients talk to.                            → deployed
  mockup-sandbox/  Dev-only component preview server (not deployed).
lib/
  db/           Drizzle ORM schema + push (PostgreSQL). Source of truth for the data model.
  api-spec/     OpenAPI spec (openapi.yaml) + Orval codegen config.
  api-zod/      Generated Zod validation schemas (from the spec).
  api-client-react/  Generated React Query hooks + the fetch transport.
.do/app.yaml    DigitalOcean App Platform spec.
DEPLOYMENT.md, NETRAKSH_PRELAUNCH_AUDIT.md, docker-compose.yml
```

**Brand vs. technical IDs:** the user-facing brand is **Netraksh**, but technical identifiers (directory, package name, Expo slug, URL scheme, Android package, native module) deliberately stay **`kavach-ai`**. Do not rename these.

**Data/contract flow:** edit `lib/db` for the schema and `lib/api-spec/openapi.yaml` for the API contract, then run codegen (`pnpm --filter @workspace/api-spec run codegen`) so `api-zod` and `api-client-react` regenerate. The clients never hand-write request/response types.

---

## 3. What is working (feature status)

### Backend API (`artifacts/api-server`) — solid
Express + Drizzle/Postgres, every endpoint Zod-validated, tiered rate limits, `trust proxy` for real client IPs. Route groups (all under `/api`):
- `/auth` — OTP login (MSG91 widget; server re-validates the token, never trusts a client phone), admin password login, sessions (hashed tokens), `DELETE /me` account deletion.
- `/check` — main fraud analysis (message / link / UPI), AI + heuristics + Safe Browsing fusion.
- `/numbers/:phone/check` — phone reputation lookup.
- `/reports` — community fraud reports + public feed.
- `/subscription`, `/webhooks` — Razorpay (web) and RevenueCat (mobile) reconciliation into one `subscriptions` table.
- `/family` — family roster.
- `/admin`, `/stats`, `/notifications`, `/broadcasts` — admin + notification feed.
- `/healthz` — health check.

### Website (`artifacts/website`) — working
Home, Features, Pricing (Razorpay), Login (MSG91 OTP), Account dashboard, Cyber Safety Center (scam articles), Family Protection. Account self-service is partial.

### Admin (`artifacts/admin`) — working
Dashboard KPIs, business metrics (MRR/renewals), interactive India fraud map, broadcasts (push + in-app feed), super-admin (infra health, AI cost, DB stats). Login is a **shared password** (`ADMIN_PASSWORD`) + at least one `ADMIN_PHONES` entry.

### Mobile (`artifacts/kavach-ai`) — working
5-in-1 Verify (number/message/link/UPI/QR), Threats feed, Family tab (partial accept-flow), RevenueCat paywall + subscriptions, share-to-check (needs a dev/prod build, not Expo Go), Guardian call screening (Android-only, `CallScreeningService` role). Onboarding + OTP login. i18n: English + Hindi (and regional strings).

### Fraud/AI engine
`api-server/src/lib/fraud-engine.ts` fuses heuristics (URL/UPI/phone reputation) with an AI classifier (`ai-classifier.ts`): **OpenAI primary, Gemini fallback** (Gemini exists because Azure's content filter false-positives on scam text). Severity-weighted scoring → Low/Medium/High bands. Per-call token usage is logged for cost tracking.

> **AI in production needs a real key.** Replit's managed AI gateway only works *inside Replit* (points at a localhost modelfarm). On DigitalOcean, set a real `OPENAI_API_KEY` (and/or `GEMINI_API_KEY`) or text-only scam checks fall back to "unknown".

---

## 4. What is deployed to DigitalOcean

Production runs on **DigitalOcean App Platform**, app name **`netraksh`**, region **`blr`** (Bangalore), behind **https://netraksh.com**. Routing under the one domain:

- `/api/*` → **api** service (Express, Dockerfile, port 8080, `preserve_path_prefix: true`).
- `/*` → **admin** static SPA (Dockerfile + nginx).
- the **website** also ships as a DO service (its `Dockerfile` exists and the live app serves it); the committed `.do/app.yaml` currently only declares `api` + `admin`, so **treat the live DO app as the source of truth and reconcile `.do/app.yaml` if you re-create the app from spec.**

Key production facts (learned the hard way — keep these in mind):
- **Production database is separate from dev.** Prod is a DO Managed Postgres (`defaultdb`); dev is the Replit Postgres. There is **no auto-migration on deploy**, so new Drizzle columns drift and prod throws `column does not exist`. Apply schema changes to prod manually with `ALTER ...` via `doctl` (no redeploy needed) or run `pnpm --filter @workspace/db push` against the prod `DATABASE_URL`.
- **Production secrets live on DigitalOcean, not Replit.** They are DO **app-level** env vars. Updating Replit Secrets only affects the Replit dev environment — it never changes production. (Also: DO component-level env vars override app-level ones — don't leave placeholder duplicates on a component.)
- DO Managed Postgres forces `sslmode=require`; the app sets `DATABASE_SSL_NO_VERIFY=true`. If you control TLS yourself, strip `sslmode` from the URL or it silently overrides your pg ssl options.
- **CORS:** `ADMIN_ORIGINS` must list every domain the admin/website SPA loads from (custom domain **and** any `*.ondigitalocean.app`) or login returns 500 "Origin not allowed by CORS".
- The generic git source on App Platform does **not** auto-deploy on push — trigger redeploys with `doctl apps create-deployment <app-id>`.
- The website's OTP needs `VITE_MSG91_*` baked in **at build time** (Dockerfile ARG + spec `BUILD_TIME` env), or prod login shows "not configured".

Full deploy steps, DNS, and the secret table are in **`DEPLOYMENT.md` §6**.

---

## 5. Expo / Android build status

The mobile app is **not** server-deployed — it ships via **EAS (Expo Application Services)**. Config is in `artifacts/kavach-ai/eas.json`:

- **`preview`** profile → Android **APK** (`buildType: apk`), `distribution: internal`, `EXPO_PUBLIC_DOMAIN=netraksh.com`. Use this for shareable test builds.
- **`production`** profile → store build, `autoIncrement`, `EXPO_PUBLIC_DOMAIN=netraksh.com`.

Because both profiles point `EXPO_PUBLIC_DOMAIN` at **netraksh.com**, an actual Android build calls the **production** API — which is publicly reachable, so **real MSG91 OTP login works on a real build**.

To produce an APK (requires an Expo account):
```bash
npm i -g eas-cli && eas login
eas build --platform android --profile preview     # internal APK
eas build --platform android --profile production  # store build
eas submit --platform android                       # upload to Play
```
The repo is **configured and ready** to build (git history shows the APK profile was set up and the app was published). Whether a specific APK artifact currently exists must be checked in the owner's **EAS dashboard** (expo.dev) — it is not stored in this repo.

> Google Play submission still has policy items to clear — see **§7** and `NETRAKSH_PRELAUNCH_AUDIT.md §9`.

---

## 6. Running it locally (dev)

```bash
corepack enable && pnpm install
# Postgres: set DATABASE_URL, then create the schema:
pnpm --filter @workspace/db push
# Run pieces (each reads PORT):
pnpm --filter @workspace/api-server run dev
pnpm --filter @workspace/website     run dev
pnpm --filter @workspace/admin       run dev
pnpm --filter @workspace/kavach-ai   run dev   # Expo (tunnel mode for physical devices)
# Quality gates:
pnpm run typecheck      # all packages
pnpm run build          # typecheck + build
```
On Replit these run as workflows automatically. See `artifacts/api-server/.env.example` for the backend env list.

---

## 7. Known issues & open items

**Dev-only login spinner (Expo Go).** There is a DEV-ONLY "Dev test login" button that bypasses OTP so Expo Go can sign in without MSG91. On a physical phone it spins forever. Root cause is **not** a code bug: the backend endpoint (`POST /api/auth/dev-login`) returns 200 and the bundle inlines the correct API domain, but the Replit dev API domain (`*.pike.replit.dev`) is **not reachable from an external phone**, so the request never lands and RN `fetch` has no timeout. This affects **only Expo Go against the Replit dev server** — a real EAS build hits `netraksh.com` and uses real OTP, which works. Options for the developer: (a) for on-device dev testing, build a `development`/`preview` EAS build pointing at a publicly reachable API; (b) add an `AbortController` timeout in `lib/api-client-react/src/custom-fetch.ts` so hangs surface as an error instead of an infinite spinner. Dev-login is disabled in production by design.

**Play Store policy (from the audit).** The audit flagged three blockers: restricted Call Log/SMS permissions, missing in-app account deletion, and an unjustified `RECORD_AUDIO` permission. These have since been **addressed in code** (Guardian reworked to `CallScreeningService` + `ROLE_CALL_SCREENING` with the restricted SMS/Call-Log permissions removed; `DELETE /me` account deletion added). **Re-verify against the current `app.json` and the Play Data Safety form before submitting.**

**Other open items (see `NETRAKSH_PRELAUNCH_AUDIT.md` for the ranked list):**
- Razorpay `payment.refunded` webhook (entitlement isn't revoked on a web refund).
- Admin console: shared password, no MFA, no per-admin accounts, no "revoke all sessions".
- Rate limiting is now **Redis-backed** (`api-server/src/lib/rate-limit.ts`): set `REDIS_URL` (a `rediss://` Managed Valkey URL) and the per-IP counters are shared across instances, so the API can scale horizontally. Without `REDIS_URL` it falls back to a per-process in-memory limiter (fine for one instance / local dev); a Redis outage degrades to that fallback rather than failing requests. **`.do/app.yaml` now sets `instance_count: 2` + `basic-s` for the API — provision a DO Managed Valkey and set `REDIS_URL` before deploying that, or the per-IP protection weakens by a factor of N.** DB pool is now explicitly sized via `DB_POOL_MAX` (default 10 per instance).
- Keep INR price parity between `plans.ts` and the store consoles.
- Note: several audit recommendations (annual plans, 7-day free trial, freemium daily quotas, AI medium-signal tuning) have **already been implemented** since the audit — check git history before re-doing them.

---

## 8. Accounts & secrets the developer must hold

Production secrets are **not** in this repo. To operate Netraksh you need access to / values for:

| Secret | Used for |
| --- | --- |
| `DATABASE_URL` | DO Managed Postgres connection string |
| `MSG91_AUTH_KEY`, `MSG91_WIDGET_ID` | OTP login (server-side validation). Note: there are **two** MSG91 widgets — one with "Mobile Integration" ON (mobile), one OFF (web). |
| `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET` | Web payments |
| `REVENUECAT_WEBHOOK_AUTH` | Mobile subscription webhook |
| `ADMIN_PASSWORD`, `ADMIN_PHONES` | Admin console login (needs both) |
| `OPENAI_API_KEY` and/or `GEMINI_API_KEY` | AI scam classification in production |
| `GOOGLE_SAFE_BROWSING_API_KEY` | (optional) URL reputation |
| `DIGITALOCEAN_ACCESS_TOKEN` | `doctl` deploys / prod DB migrations |

External accounts to take over: **DigitalOcean** (App Platform app `netraksh` + Managed Postgres + DNS), **Expo/EAS** (mobile builds), **MSG91** (OTP), **Razorpay**, **RevenueCat**, **Google Play Console**, **Apple Developer** (for iOS), and the **GoDaddy/DNS** for netraksh.com.

---

## 9. First-week checklist for the new developer

1. Get access to the accounts in §8 and the DO app `netraksh`.
2. `pnpm install`, set a local `DATABASE_URL`, `pnpm --filter @workspace/db push`, then `pnpm run typecheck`.
3. Read `DEPLOYMENT.md` (deploy mechanics) and `NETRAKSH_PRELAUNCH_AUDIT.md` (open risks).
4. Reconcile `.do/app.yaml` with the live DO app (especially the website service).
5. Decide on the dev-login fix (§7) and the Razorpay refund webhook.
6. Walk the Play Store readiness items in the audit before submitting the Android build.
