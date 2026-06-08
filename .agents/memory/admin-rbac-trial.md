---
name: Admin RBAC + trial-write integrity
description: Two durable rules for the data-driven admin RBAC and admin-controlled trial mutations on the API server.
---

# Admin RBAC + trial-write integrity

## Rule 1 — admin routes must authorize on permissions, never the isAdmin boolean
All `/admin/*` routes (including the legacy `admin.ts` ones) must gate on
`requirePermission(PERMISSIONS.*)`, not the old `requireAdmin` (which only
checked the boolean `isAdmin`). `super-admin.ts` stays on `requireSuperAdmin`.

**Why:** roles are data-driven (roles table + permissions jsonb). Assigning any
staff role flips `isAdmin=true`, so a `requireAdmin` gate let e.g. a `support`
role reach owner-level endpoints = privilege escalation.

**How to apply:** when adding a new admin endpoint, pick/define a permission key
and wrap with `requirePermission`. `requireAdmin` is kept exported only for
backward compat — do not use it on new routes.

## Rule 2 — admin trial writes must not clobber a concurrent paid activation
`adminGrantTrial`/`adminResetTrial` do read → `assertNotActivePaid` → write.
A payment webhook (`activateSubscriptionForOrder`) can commit a paid
subscription in that window. The write therefore ANDs `notActivePaidCondition(now)`
(plan='free' OR status!='active' OR currentPeriodEnd IS NULL OR currentPeriodEnd<=now)
into its WHERE and uses `.returning()`; an empty result means a paid activation
won the race → throw `ACTIVE_SUBSCRIBER_ERROR`.

**Why:** matches the codebase's existing idempotent conditional-update idiom
(payment path already claims the order atomically via `status != 'paid'`), so no
transaction/row-lock needed. `status='trialing'` passes the guard, so legitimate
extend/reset of a live trial is NOT rejected — only live *active paid* rows are.

**How to apply:** any future admin mutation that downgrades/overwrites a
subscription must reuse `notActivePaidCondition` + `.returning()` rather than a
bare `eq(id, …)` update.
