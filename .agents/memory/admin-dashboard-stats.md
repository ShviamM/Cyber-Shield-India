---
name: Admin dashboard stats / DAU semantics
description: How the admin /admin/stats KPIs are computed and why "Daily Active Users" is login-based.
---

The admin console Overview cards come from `GET /admin/stats` (admin-only),
which runs simple aggregates over existing tables. There is no analytics/events
table.

- **"Daily Active Users" is login-based**: it counts distinct users with a
  `sessions` row whose `created_at` is within the last 24h. **Why:** there is no
  per-request activity signal (no `lastSeenAt`, no events table), so session
  creation (login) is the only available proxy. Don't mistake this for true
  activity-based DAU; if real activity DAU is ever needed, add an activity
  signal rather than reinterpreting sessions.
- **"Scam URLs" is deliberately absent**: URL checks are analyzed on the fly and
  never persisted, so there is no count to show. Adding it requires persisting
  flagged URLs first.
- node-postgres returns `sum(...)` and `count(distinct ...)` as **strings**;
  coerce with `Number()`. Drizzle's `count()` helper already returns a number.
- Revenue is stored in **paise** (`payments.amount`, integer); divide by 100 for
  rupees when displaying.
