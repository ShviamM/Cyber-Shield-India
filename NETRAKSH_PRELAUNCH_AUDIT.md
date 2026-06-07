# Netraksh — Pre-Launch Audit & Play Store Readiness Report

**Date:** 07 June 2026
**Scope:** Android (Google Play) launch of the Netraksh mobile app (Expo / `kavach-ai`), backed by the shared API server, admin console, and `netraksh.com` website.
**Reviewer lens:** Senior Play Store reviewer + SaaS CTO + fintech compliance + cybersecurity + subscription strategy.
**Nature of this document:** Analysis only — no code was changed.

---

## A. Executive Summary

Netraksh is **India's Digital Bodyguard** — an AI-powered fraud-prevention app that lets ordinary Indians instantly check whether a phone number, SMS/WhatsApp message, link, UPI ID, or QR code is a scam, plus real-time "Guardian" call/SMS screening and a family-safety shield. The tagline *"Thag se 2 kadam aage"* (two steps ahead of fraudsters) captures it well.

**The good news:** This is a genuinely strong, well-architected product — far past MVP. The core fraud engine fuses deterministic heuristics with two AI providers and Google Safe Browsing; auth is correctly designed (the server never trusts a client-supplied phone number); payments are live on **both** RevenueCat (Play Billing) and Razorpay (web) with proper webhook signature verification; privacy policy and terms exist and reference India's DPDP Act 2023. Most apps at this stage are nowhere near this complete.

**The blockers:** Launch readiness is **not** gated by product quality — it's gated by **two Google Play policy items**:
1. **Restricted permissions** — the app requests `READ_CALL_LOG`, `RECEIVE_SMS`, and `READ_PHONE_STATE`. Google Play heavily restricts Call Log and SMS access; without the correct API approach + an approved Permissions Declaration, this is the **single most likely cause of rejection**.
2. **No in-app "Delete Account"** — Google Play requires a readily discoverable self-service account deletion path for any app with accounts. Today the app only has "Sign Out."

Fix those two, tidy a short list of medium items (unjustified `RECORD_AUDIO` permission, refund reconciliation, fraud-scoring tuning), and Netraksh is ready.

**Verdict: Launch After Major Fixes** — where "major" means *policy/compliance*, not *engineering rework*. The estimated effort is days, not weeks.

---

## 1. Product Understanding

- **What it does:** Instant scam checks (number / message / link / UPI / QR), real-time call & SMS screening ("Guardian"), a community fraud-report feed, city-level scam hotspots, daily safety tips, and a family protection roster.
- **Target users:** Everyday Indian smartphone users — especially the digitally-vulnerable (parents, elders, first-time UPI users) and the family members who protect them.
- **Core value proposition:** "Before you trust a number, link, or payment — check it in 5 seconds." Plus passive protection that warns you about scam calls/SMS automatically.
- **30-second comprehension:** **Yes.** The Home screen leads with the 1930 cybercrime helpline SOS, a Guardian toggle, and four obvious actions (Verify Number, Check Link, Scan Message, Report Fraud). A first-time user understands the app immediately. Onboarding (language → Guardian explainer → phone login) reinforces it.

---

## 2. Complete Functionality Audit

### Existing features (live)
- **5-in-1 Verify engine:** number, message, link, UPI ID, QR scan (camera).
- **AI fraud analysis:** dual-provider (OpenAI/Azure → Gemini fallback) + Safe Browsing + reputation DB, with color-coded risk, 0–100 score, category, and "Why?" rationale.
- **Guardian (Android):** native call/SMS screening module (`kavach-screening`) that alerts on known-bad numbers.
- **Share-to-check:** receive a message/link shared from WhatsApp etc. and auto-route it to Verify.
- **Community:** report fraud, public reports feed, trending scams, city hotspots, "Scam of the Day."
- **Family Shield:** add up to 5 members (Family plan), see safe/alert status.
- **Notifications:** push tokens + in-app notification feed (push is best-effort; feed is the reliable channel).
- **Subscriptions:** Free / Premium ₹10/mo / Family ₹49/mo, via Play Billing (RevenueCat) on mobile, Razorpay on web; payment history.
- **Localization:** English, Hindi, and several regional languages.
- **Admin console:** moderation, KPIs, fraud map, broadcasts, super-admin infra/AI-cost view.

### Missing / launch-blocking
- ❌ **In-app account deletion** (Play requirement).
- ❌ **Correct handling of restricted Call Log / SMS permissions** (Play requirement).
- ⚠️ Unjustified `RECORD_AUDIO` permission in `app.json`.

### Nice-to-have (post-launch)
- iOS Guardian parity (currently Android-only; iOS already explains the limitation).
- Numeric App Store ID for the iOS "rate us" link (currently falls back to a search).
- Web pricing/checkout UI (Razorpay backend is ready; site is "launching soon").
- In-app refund/appeal flow; explicit regional-language prompt tuning for the AI.

---

## 3. Authentication & User Management

**How OTP login works (well-designed):**
1. App uses the **MSG91 OTP Widget** — MSG91 sends and verifies the SMS code on their infrastructure.
2. On success the widget returns a short-lived `access-token` to the app.
3. App calls `POST /api/auth/verify-token`; the **backend** re-validates that token with MSG91 using the private `MSG91_AUTH_KEY` and trusts **only** the phone number MSG91 returns — never a client-supplied number. ✅ This is the correct, secure pattern.
4. Backend issues a random session token; only its SHA-256 **hash** is stored in the `sessions` table. ✅

| Area | Status |
|---|---|
| Mobile OTP login | ✅ Live, secure |
| Email OTP login | ➖ Not implemented (phone-first is correct for this market) |
| Social login (Google/Apple/FB) | ➖ Not implemented (optional; Apple/Google sign-in nice for iOS later) |
| Passwordless | ✅ (OTP is passwordless) |
| Account recovery | ✅ Implicit via phone ownership (no passwords to lose) |
| Session management | ✅ Hashed tokens, expiry |
| Multi-device | ✅ Multiple concurrent sessions supported |
| Logout | ✅ Per-session revoke |
| Profile management | ✅ Name/location editable |
| **Account deletion** | ❌ **Missing self-service endpoint/UI (compliance gap)** |

**Friction / risk points:**
- **Admin console uses a single shared password** (no MFA, single point of failure). Rate-limited (5/min, 30/hr) but should get per-admin accounts + MFA before scaling the team.
- **No admin "revoke all sessions for user X"** — useful for abuse/lost-device cases.
- **No user self-deletion endpoint** — see compliance section.

---

## 4. AI Feature Audit

**Architecture:** `fraud-engine.ts` uses **severity-weighted fusion** — it extracts embedded entities (URLs, UPI IDs, phone numbers) from a message, scores each signal (`high 55 / medium 40 / low 12 / info 0`), and bands the total: **High ≥ 70, Medium 40–69, Low 15–39, Safe < 15**.

**Provider chain (`ai-classifier.ts`):**
- **Primary:** OpenAI via Replit/Azure (`gpt-5-mini`), JSON-mode classification.
- **Fallback:** Google **Gemini 2.5 Flash** with `BLOCK_NONE` — used because Azure's content filter false-positives on scam text (e.g., job/sextortion scams) and refuses to analyze it. Category names are also aliased (e.g., "sextortion" → "blackmail_extortion") to dodge upstream filters. ✅ Thoughtful.
- **Last resort:** deterministic-only mode (reputation + link heuristics) if both AIs are down.

**Quality & safety:**
- Strict JSON output (`is_scam`, `category`, `confidence`, `rationale`) limits hallucination; rationale capped at 280 chars and PII-stripped. ✅
- System prompt warns against flagging legitimate bank alerts / OTP delivery messages. ✅
- UPI analysis recognizes real PSP handles and pulls embedded phone-number reputation; link analysis flags suspicious TLDs, brand impersonation, punycode; Safe Browsing integrated. ✅
- Per-call token usage logged for cost visibility on the super-admin dashboard. ✅

**Risks / opportunities:**
- ⚠️ **Scoring blind spot:** a lone "high" AI signal scores **55**, which is **below the 70 High threshold** — so an AI-confirmed scam with no embedded link/number can surface as only **Medium**. Recommend: let a "high"-confidence AI verdict alone reach the High band (or raise its weight). This is the most impactful accuracy fix.
- Explicit per-language prompt tuning (Hindi/Tamil/Telugu/etc.) would lift accuracy on localized scams.
- **Premium AI upsell opportunity:** deeper explanations, screenshot/image scam analysis, voice-call transcript checks, and "ask the AI a follow-up" are natural paid features.

---

## 5. Payment System Audit

| Item | Mobile (RevenueCat / Play Billing) | Web (Razorpay) |
|---|---|---|
| Subscriptions | ✅ Entitlement `premium`, `current` offering, monthly + family packages | ✅ Order + webhook |
| Purchase linked to user | ✅ `logIn(user.id)` before purchase | ✅ |
| Restore purchases | ✅ | n/a |
| Signature/webhook security | ✅ Shared-secret webhook auth | ✅ HMAC-SHA256 on `order_id|payment_id` + webhook signature against raw body |
| Failed payment handling | ✅ via webhook | ✅ `payment.failed` marks order |
| Upgrade/downgrade | ✅ store-managed pro-rata | ✅ extends `currentPeriodEnd` from later of now/expiry |
| **Refund reconciliation** | OS-managed (RevenueCat reflects it) | ❌ **No `payment.refunded` handler — user stays Premium after a web refund until period ends** |
| Trials / coupons | ➖ Not in code — must be configured in Play Console/RevenueCat | ➖ |

**Google Play Billing compliance:** ✅ The Android app uses Play Billing (via RevenueCat) for all digital upgrades. Access is granted if *either* the RevenueCat entitlement *or* the backend DB shows active — correct cross-platform behavior.

**Risks:**
- ❌ Razorpay **refund webhook missing** (entitlement won't revoke on refund).
- ⚠️ **Price parity:** server INR prices (₹10/₹49) live in `plans.ts`; Play Store prices live in the console. If one changes without the other, web and app disagree.
- ⚠️ **Anonymous-purchase edge case:** if `logIn` fails but a purchase still goes through, the webhook may receive an anonymous ID that can't be auto-linked to the account.
- ⚠️ Ensure `REVENUECAT_WEBHOOK_AUTH` is a strong unique production secret.

---

## 6. Subscription & Monetization Review

**Current tiers:** Free ₹0 · Premium **₹10/mo** · Family **₹49/mo** (up to 5 members).

**Assessment:** Pricing is *aggressively low*. ₹10/mo is excellent for mass adoption and trust-building in India, but leaves significant revenue on the table and may even read as "too cheap to be serious" to some users.

**Recommendations (ranked):**
1. **Add annual plans** with ~2 months free (e.g., Premium ₹99/yr, Family ₹449/yr). Annual plans dramatically improve LTV and cut churn — this is the highest-ROI monetization change.
2. **Introduce a 7-day free trial** on Premium/Family (configure in Play Console/RevenueCat) to lift conversion.
3. **Consider a mid-tier or raise Premium to ₹19–₹29** once value is proven; keep a free tier generous enough for virality.
4. **Premium feature gating to lean into:** unlimited checks (free is rate-limited to 20/min vs 60/min premium), image/screenshot scam analysis, AI follow-up Q&A, priority Guardian alerts, family monitoring.
5. **Enterprise/NGO/bank tier** (bulk seats, awareness dashboards) is a credible B2B2C path later.

---

## 7. End-to-End User Journey

| Stage | Status | Notes |
|---|---|---|
| First launch | ✅ | Branded launch screen until auth resolves |
| Onboarding | ✅ | Language → Guardian explainer |
| OTP verification | ✅ | New users prompted for name/location before OTP |
| First use | ✅ | Home → tap an action → instant result |
| Premium upgrade | ✅ | Paywall with 3 tiers, restore + manage links |
| Renewal | ✅ | Store-managed + webhook reconciliation |
| Cancellation | ✅ | `Manage on Store` deep link + `/subscription/cancel` |
| Re-login | ✅ | OTP again; multi-device supported |
| Support request | ⚠️ | Helpline + email present; **no in-app support/ticket or FAQ-to-contact flow** |

**Drop-off / conversion risks:**
- The lone-"high"-signal scoring quirk could under-warn a user on a real scam → erodes trust (fix in §4).
- No trial = users must pay before experiencing premium value.
- Guardian is Android-only; iOS users see an explainer (good), but it's a perceived-value gap on iOS.

---

## 8. Security Audit

**High**
- **Shared admin password, no MFA** — single point of failure for the whole admin surface.
- **Restricted Android permissions** (`READ_CALL_LOG`, `RECEIVE_SMS`) — both a policy *and* a privacy-attack-surface concern.

**Medium**
- **In-memory rate limiting** — not synchronized across multiple API instances; under horizontal scaling, limits effectively multiply. Move to Redis before scaling out.
- **No admin global session revocation** for a compromised/abusive user.
- **Anonymous-purchase linkage** edge case (see §5).
- **Refund → entitlement** not revoked on web (see §5).

**Low**
- `RECORD_AUDIO` permission present without a clear use — drop it or justify it.
- No structured **appeal flow** for numbers flagged as scams (false-positive remediation).

**Strengths (already correct):** server-side OTP validation (never trusts client phone), hashed session tokens, Zod validation on every endpoint, `trust proxy` for accurate per-IP limits, tiered rate limits (OTP 30/hr, token-verify 10/min, admin-login 5/min), CORS allowlist for the admin SPA, HMAC webhook verification against the raw body.

---

## 9. Play Store Readiness Audit

| Requirement | Status |
|---|---|
| Privacy policy (in-app + web) | ✅ Present, DPDP Act 2023 + IT Act 2000 referenced |
| Terms of service | ✅ Present |
| AI/financial disclaimers | ✅ Present (not foolproof; user responsible for decisions) |
| Subscription disclosures + manage/restore | ✅ Present |
| Permission justifications in `app.json` | ✅ Camera, Location justified |
| **Restricted permissions declaration (Call Log/SMS)** | ❌ **Must use CallScreeningService/role + Permissions Declaration, or rejection is likely** |
| **In-app account deletion** | ❌ **Required, missing** |
| Data safety form alignment | ⚠️ Must match actual collection (phone, submitted content, location); remove `RECORD_AUDIO` if unused |
| "Never blocks, only alerts" call behavior | ✅ Safer posture, good |

---

## 10. Scalability Review

- **Backend:** clean Express + Drizzle/Postgres, Zod-validated, webhook-driven entitlement state. Solid foundation.
- **Database:** sensible schema (`users`, `sessions`, `fraud_reports`, `number_reputation`, `subscriptions`, `payments`, `device_tokens`, `family_members`, AI-usage). Add indexes on hot lookups (phone, tokenHash, reporter/city) before heavy traffic.
- **API performance:** fine for current scale; the AI calls are the latency/cost driver — already low-latency models + cost logging.
- **Scale-out blocker:** **in-memory rate limiting** must move to a shared store (Redis) before running multiple instances.
- **AI scalability/cost:** dual-provider fallback is resilient; watch token spend and consider caching identical recent checks.
- **Payments:** RevenueCat + Razorpay both scale fine; webhooks are the source of truth (good).

---

## 11. Launch Readiness Score

| Dimension | Score /100 |
|---|---|
| Product Quality | 84 |
| UX | 80 |
| Security | 74 |
| AI | 80 |
| Payments | 85 |
| Subscriptions | 80 |
| Compliance | 66 |
| Scalability | 72 |
| Monetization | 72 |
| **Play Store Readiness** | **60** |
| **Overall** | **~74 / 100** |

The overall is dragged down almost entirely by **Play Store policy** items (permissions + account deletion), not by product or engineering quality.

---

## 12. Final Launch Report

### A. Executive Summary
See top of document. Strong product; launch gated by two Play policy fixes.

### B. Critical Issues That Must Be Fixed Before Launch
1. **Restricted Call Log / SMS permissions** — adopt `CallScreeningService`/default-handler role design and submit the **Permissions Declaration**, or remove these permissions and scope Guardian accordingly. *(Top rejection risk.)*
2. **In-app "Delete Account"** — add a self-service deletion (button + `DELETE /me` endpoint cascading user data).
3. **Remove or justify `RECORD_AUDIO`** and ensure the **Data Safety form** matches actual collection.

### C. Missing Features
Account deletion (blocker), web pricing/checkout UI, iOS Guardian parity, in-app support/FAQ flow, annual plans + trials, refund/appeal flow, numeric iOS App Store ID.

### D. Authentication & OTP Review
Secure and well-built (server-validated MSG91, hashed sessions, multi-device, logout). Gaps: no self-deletion, admin shared password/no MFA, no admin session revocation.

### E. AI Review
Robust dual-provider fusion with Safe Browsing and strong anti-hallucination guards. Fix the **lone-high-signal → Medium** scoring quirk; add per-language prompt tuning; monetize deeper AI.

### F. Payment & Billing Review
Play Billing + Razorpay both live with proper signature/webhook security. Add **Razorpay refund webhook**, guard the **anonymous-purchase** edge case, and keep **price parity** between `plans.ts` and the store.

### G. Subscription Review
Tiers work and are compliant. Pricing is very low — add **annual plans + free trial**, consider a modest Premium price increase, and lean into premium AI/limits gating.

### H. Security Review
Good fundamentals. Address admin MFA, move rate limiting to Redis before scale-out, add session revocation, drop unused permission.

### I. Compliance Review
Privacy policy + ToS + disclaimers present and DPDP-aware. Must add **account deletion** and align the **Data Safety** declaration.

### J. Google Play Rejection Risks
1. Call Log/SMS permissions without correct API + declaration **(high)**.
2. Missing in-app account deletion **(high)**.
3. Data Safety mismatch / unjustified `RECORD_AUDIO` **(medium)**.
4. Sensitive claims — already mitigated by disclaimers and "alert not block" behavior **(low)**.

### K. Top 20 Improvements Ranked by Impact
1. Adopt compliant Call/SMS screening (CallScreeningService) + submit Permissions Declaration. *(unblocks launch)*
2. Add in-app "Delete Account". *(unblocks launch)*
3. Remove/justify `RECORD_AUDIO`; align Data Safety form. *(unblocks launch)*
4. Fix AI scoring so a lone high-confidence verdict reaches High risk. *(trust)*
5. Add Razorpay `payment.refunded` webhook to revoke entitlement. *(revenue integrity)*
6. Add **annual plans** + **7-day free trial**. *(revenue)*
7. Admin MFA + per-admin accounts. *(security)*
8. Move rate limiting to Redis before multi-instance scaling. *(scale)*
9. Guard the anonymous-purchase linkage edge case. *(revenue integrity)*
10. In-app support/FAQ → contact flow. *(retention)*
11. Per-language AI prompt tuning (Hindi/Tamil/Telugu…). *(accuracy)*
12. Admin "revoke all sessions for user". *(security)*
13. Add DB indexes on phone/tokenHash/city/reporter. *(scale)*
14. False-positive **appeal** flow for flagged numbers. *(trust)*
15. Premium AI features (image/screenshot scan, follow-up Q&A). *(monetization)*
16. Price-parity guard between `plans.ts` and store. *(consistency)*
17. Web pricing/checkout UI (Razorpay backend already ready). *(web revenue)*
18. iOS Guardian parity (or clearer iOS value framing). *(iOS UX)*
19. Numeric iOS App Store ID for rate/review link. *(polish)*
20. Cache identical recent AI checks to cut latency/cost. *(cost)*

### L. Final Recommendation
**Launch After Major Fixes** — but understand "major" here means **policy/compliance**, not product rework. Netraksh is a high-quality, feature-complete app. Resolve the **three blockers in §B** (Call/SMS permission approach + Permissions Declaration, in-app account deletion, and Data Safety/`RECORD_AUDIO` cleanup), apply the quick AI-scoring and refund-webhook fixes, and Netraksh is ready for a confident Play Store submission. Estimated blocker effort: **days, not weeks.**
