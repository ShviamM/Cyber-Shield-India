---
name: Post-call scam reporting (Play-compliant)
description: Why Netraksh has no true post-call popup and how the compliant substitute works.
---

A TRUE post-call popup (fires when a call ends) is impossible without restricted
call-state permissions (READ_PHONE_STATE / READ_CALL_LOG), which Netraksh must
never add (Play rejection risk — see play-permissions-policy.md). `CallScreeningService`
only fires at incoming-call time, never at call-end.

**Compliant substitute:** at screen-time (inside `onScreenCall`, after the
full-screen alert, and ONLY for non-blocked numbers) the native service posts a
quiet `IMPORTANCE_LOW`, auto-cancel notification on a *separate* channel
(`kavach_call_report`) that deep-links `kavach-ai://report-call?number=<encoded>`.
Because it's low-importance it doesn't intrude during the call, and it lingers in
the shade so the user can tap it right after hanging up — the post-call moment,
achieved without any call-ended hook.

**Why:** Android exposes no Play-allowed call-ended callback; posting early +
letting the notification persist is the only compliant way to offer post-call
reporting.

**How to apply:**
- Quick-report screen is `app/report-call.tsx` (1-tap, number prefilled). It uses
  `useNearbyCity({ prompt: false })` — city is optional metadata, so it must
  never trigger a location permission prompt.
- The 4 call-type categories (scam_call/fraud_call/spam_call/telemarketing) are
  seeded on boot and intentionally filtered OUT of the detailed pickers
  (report.tsx, call-alert.tsx) via CALL_REPORT_CATEGORY_KEYS so they only appear
  in the quick screen.
- Give the report notification a distinct request code / id namespace from the
  full-screen alert so the two for the same number don't clobber each other.
