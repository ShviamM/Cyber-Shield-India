---
name: RevenueCat ↔ backend subscription reconciliation
description: How in-app (Google Play) subscriptions reconcile to the backend subscriptions table, and the non-obvious guards that keep it correct.
---

# RevenueCat reconciliation rules

The backend `subscriptions` table is the source of truth for premium gating
(family limits, etc). Store purchases (Google Play via RevenueCat) are NOT
authoritative on their own — they must reconcile to that table through the
RevenueCat server webhook. The website keeps using Razorpay.

**Why:** the app shows premium when EITHER the backend OR the on-device RC
entitlement says so, but family-member limits and server-side checks read the
backend row only. If a store purchase never reaches the backend, the UI looks
premium while server enforcement still treats the user as free.

## Guards that are easy to get wrong
- **Identity before purchase.** The RC customer must be `logIn(user.id)` before
  buying; otherwise the purchase is anonymous, the webhook's `app_user_id` is an
  `$RCAnonymousID`, and reconciliation silently no-ops. Abort the purchase if
  identification fails — do not buy anonymously.
- **Out-of-order webhook events.** RevenueCat retries can deliver an older event
  after a newer one. Reconciliation must never move the stored billing period
  end backwards, or a late first-period EXPIRATION/renewal clobbers an
  already-renewed subscription. Compare incoming vs stored `currentPeriodEnd`.
- **Explicit event allowlist.** Map only INITIAL_PURCHASE/RENEWAL/PRODUCT_CHANGE/
  UNCANCELLATION/NON_RENEWING_PURCHASE → active; CANCELLATION → canceled (access
  until period end); EXPIRATION/SUBSCRIPTION_PAUSED → expired. Ignore everything
  else (TEST, TRANSFER, BILLING_ISSUE, SUBSCRIBER_ALIAS). Never treat
  "any non-EXPIRATION event" as active.
- **Webhook auth + retries.** Authenticated with the shared `REVENUECAT_WEBHOOK_AUTH`
  bearer (503 when unset, like Razorpay); always answer 200 on processing errors
  / unknown users so RevenueCat doesn't retry-storm.

## Product → plan mapping
Play products carry a `"{subscriptionId}:{basePlanId}"` suffix — strip at `:`
before mapping. `premium_monthly` → premium, `family_monthly` → family.

**How to apply:** any change to store billing must keep these four guards intact;
they are not obvious from reading a single function.
