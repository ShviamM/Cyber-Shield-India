---
name: Trial eligibility across billing channels
description: Why website free-trial eligibility must consider RevenueCat (app-store) history, not just Razorpay payments rows.
---

# Cross-channel free-trial eligibility

The website "7-day no-card trial" is one-per-user. Eligibility must be denied to
anyone who has *ever* had a paid entitlement, regardless of billing channel.

**Why:** Razorpay purchases create `payments` rows, but app-store purchases
reconciled via RevenueCat only upsert the `subscriptions` row — they never write
a `payments` row. So a payment-history-only check (`payments.status='paid'`)
misses lapsed mobile subscribers, who would then look trial-eligible on the web.

**How to apply:** In `computeTrialEligible`, treat a subscription row whose plan
is paid and that carries a non-null `currentPeriodEnd` but a null
`trialStartedAt` as evidence of a prior paid entitlement (trials always stamp
`trialStartedAt`, so such a period can only come from a real paid activation —
Razorpay or RevenueCat). Combine with: never trialed (`trialStartedAt is null`),
not currently premium, and no paid Razorpay payment.

**Also:** `startTrial` must write atomically — guard the existing-row UPDATE with
`trialStartedAt is null` and use `onConflictDoNothing(userId)` on the INSERT — so
two concurrent requests can't grant two trials or 500 on the unique-userId index.
