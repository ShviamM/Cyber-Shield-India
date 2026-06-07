---
name: Paywall billing-period dimension
description: Why the kavach-ai paywall must treat monthly/annual as a first-class dimension everywhere, and how free trials are surfaced.
---

# Billing period is a first-class dimension in the paywall

The kavach-ai subscription paywall (RevenueCat, mobile) supports monthly AND annual
billing per plan. Treat the billing period as a dimension that flows through every
piece of plan logic — package lookup, purchase, current-plan detection, and the CTA.

**The trap:** a plan-only `isCurrent` (`key === currentPlan`) hides the purchase CTA
for the plan the user already owns, regardless of period. That silently blocks an
existing monthly subscriber from switching to the *annual* variant of the same plan.
`isCurrent` (and the "switch" CTA) must compare BOTH plan and period.

**Why:** code review caught this exact gap when annual plans were added; without it
annual adoption is blocked for existing same-plan subscribers.

**How to apply:**
- Package lookup keys are nested per period (premium {$rc_monthly,$rc_annual},
  family {family,family_annual}); derive the active period from the product id
  suffix (`*_annual` / `*_monthly`), Razorpay/website defaults to monthly.
- Show annual as "coming soon" (disabled) on real store builds when the annual
  package isn't in the current offering yet — avoids dead-end "checkout unavailable"
  alerts in the window between an app release and store/RevenueCat config.

**Free trials / intro offers:** surface the trial badge ONLY from the real store
`product.introPrice` (price === 0), never a hardcoded string. That way it appears
exactly when the trial is actually configured in Play Console, and is accurate per
SKU. Normalize the intro period to days (WEEK → ×7) for display.
