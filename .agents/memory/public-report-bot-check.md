---
name: Public report bot-check (proof-of-work)
description: How anonymous POST /reports/public is hardened against IP-rotating bots without an external CAPTCHA service.
---

The anonymous community-report endpoint (POST /reports/public) is protected by a
self-contained, keyless proof-of-work bot-check (no Turnstile/reCAPTCHA, no env keys
required to function).

**Why:** per-IP rate limits + per-IP+phone dedupe don't stop a bot rotating IPs from
poisoning the community reputation stores (number_reputation / target_reputation).
PoW makes each accepted report cost real CPU, and an external CAPTCHA would add a
third-party dependency + keys we wanted to avoid.

**How it works:**
- Server issues an HMAC-signed challenge (`GET /reports/public/challenge`): random
  nonce + expiresAt + difficulty, signed with `botCheckSecret`.
- Client solves: find solution where `sha256("<challenge>.<solution>")` has
  `difficulty` leading hex zeros (default difficulty 4 ≈ sub-second in browser).
- POST /reports/public re-verifies: fields present → HMAC via timingSafeEqual →
  not expired → hash difficulty. Failure → 403 `{error:"bot_check_failed"}`.
- One-time replay guard: a used challenge is burned via the rate-limiter store
  (`pow-used:<challenge>`) for the challenge TTL, so the same solved challenge
  can't be reused for a second report.

**Config (config.ts):** `BOT_CHECK_SECRET` (falls back to per-process randomBytes —
fine for single instance, but set a stable secret if running multiple API instances
or challenges issued by one instance fail verification on another), `botCheckDifficulty`
(default 4), `botCheckTtlMs` (default 5min).

**Client mapping:** website CheckScam ReportScam fetches+solves before submit; 403
maps to the `report.error.verification` i18n key (en + hi). Keep difficulty low so
legit reporting stays ~1-2 clicks.
