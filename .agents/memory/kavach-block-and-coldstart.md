---
name: Call cold-start + blocklist source-of-truth limits
description: Two durable constraints for the incoming-call popup and number blocking on the kavach-ai Android app.
---

# Incoming-call popup cold-start

The native CallScreeningService surfaces the caller card by deep-linking into the
RN app (`kavach-ai://call-alert`). On a cold start that boots the whole Expo app
(launch overlay + auth gate → home) before the modal resolves, so it feels like
"the app opened" rather than a lightweight popup.

**Mitigation (RN-level, shipped):** in `app/_layout.tsx` detect the call-alert
route (`segments[0] === "call-alert"`) and for it: force the LaunchScreen to exit
immediately, skip the Onboarding overlay, and bypass the unauthenticated→login
redirect (the reputation lookup works anonymously). Also guard the auth effect
with an empty-`segments` check so a signed-out cold deep-link can't briefly bounce
to login before the route resolves.

**Why not a true overlay:** a Truecaller-grade floating window that never opens
the app needs a native Kotlin `WindowManager`/`TYPE_APPLICATION_OVERLAY` card +
native HTTP reputation lookup — i.e. re-adding the native card the project
deliberately replaced with the RN screen. Treat that as a separate, large decision.

# Blocking: two source-of-truth limits

1. **User blocks must be stored separately from the engine blocklist.**
   `syncEngineData()` → `syncBlocklist()` → `ScreeningStore.setBlocklist()`
   *replaces the whole* `KEY_BLOCKLIST` set and runs on every `recentChecks`/
   `serverBlocklist` change. So a user's manual block (Block button →
   `addToBlocklist`) MUST live in its own key (`KEY_USER_BLOCKLIST`) or it gets
   silently wiped. `isBlocked()` checks the UNION of both sets. The in-app
   Blocked-numbers screen shows/edits only the user set (engine numbers are
   auto-managed and would just re-sync if "unblocked").
   **No legacy migration was added** — first Play release (no install base), and
   the old shared set can't distinguish user vs engine entries, so copying all of
   it would wrongly promote engine numbers into the user's list.

2. **System block-list sync is not possible for this app.** Writing Android's
   `BlockedNumberContract` (so blocks show in Phone → Settings → Blocked numbers)
   requires being the DEFAULT dialer/SMS app. A `ROLE_CALL_SCREENING` app cannot
   — it can only `setRejectCall` per call (already done). Real "hard to find/remove"
   pain is solved by the in-app Blocked-numbers screen instead.
