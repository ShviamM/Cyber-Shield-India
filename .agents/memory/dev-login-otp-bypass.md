---
name: Dev-only OTP-bypass login
description: How/why the kavach-ai app can sign in without OTP in Expo Go, and the safety invariant that keeps it out of production.
---

# Dev-only test login (POST /auth/dev-login)

MSG91's OTP widget is a native RN SDK — it cannot run in Expo Go or the web
preview, so there is a dev-only login that issues a session from just a phone
(+ fullName/location on first registration), skipping MSG91 entirely.

**Safety invariant (do not weaken):** the route is *fail-closed*. It is gated on
`isDevLoginEnabled()` (in api-server `config.ts`) which requires BOTH
`NODE_ENV !== "production"` AND an explicit `ENABLE_DEV_LOGIN === "true"`, read
**live** from `process.env` (not cached at import) so it is unit-testable and
can never be baked in. A prod env that is merely misconfigured (NODE_ENV unset,
"staging", etc.) still keeps it disabled because the opt-in flag is absent. When
disabled it returns 404 (invisible, not 403).

**Why:** an OTP-bypass endpoint reachable in production = full account takeover by
phone only. A single `isProduction` check is convention-based and fail-open to
any non-"production" NODE_ENV; the double gate makes accidental exposure require
two independent mistakes.

**How to apply:**
- Dev workflow turns it on: the api-server `dev` script exports
  `ENABLE_DEV_LOGIN=true`. The prod Dockerfile sets `NODE_ENV=production` and
  never sets the flag → double-off.
- The mobile button is additionally `__DEV__`-gated in `login.tsx`.
- It mirrors `/auth/verify-token` for existing users (refresh fullName/location,
  only escalate admin, never strip) and has its own per-IP rate limit.
