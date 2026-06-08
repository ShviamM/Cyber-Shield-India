---
name: RevenueCat vs Razorpay provider scope
description: Why a trial/subscription started on the website never appears in RevenueCat, and where trial state actually lives.
---

RevenueCat is wired to the MOBILE app only (kavach-ai, react-native-purchases) for App Store / Play Store IAP. The WEBSITE uses Razorpay. There is no website↔RevenueCat link and there never will be by design.

**Why:** RevenueCat only tracks native store transactions. A website "Start Trial" (no card) calls `POST /subscription/trial` → `startTrial()` and writes a `subscriptions` row directly; Razorpay paid web flows write `payments` + `subscriptions`. Mobile store purchases reconcile via the RevenueCat webhook into the SAME `subscriptions` table. So our Postgres `subscriptions` table is the single source of truth across both providers — RevenueCat is not a mirror of it.

**How to apply:** If someone says "I made a trial/subscription on the website but can't see it in RevenueCat," that is expected, not a bug. Verify the trial by querying `subscriptions` (status='trialing'), not RevenueCat. Admin trial/subscription views must be DB-backed, never RevenueCat-backed. `status='trialing'` rows only ever come from the no-card trial flow (web or app) — store free trials are reconciled as active, not trialing. Count "active trials" as `status='trialing' AND current_period_end >= now` because expired trials keep the trialing status until `computeEffective` lazily flips them.
