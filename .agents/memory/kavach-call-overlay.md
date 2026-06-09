---
name: KavachAI Truecaller-style call overlay
description: How the incoming-call "pop" overlay is built and why it stays on-device
---

# Incoming-call overlay (Truecaller-style "pop")

A WindowManager `TYPE_APPLICATION_OVERLAY` top-banner card shown for EVERY
incoming call (user chose all-calls, not scam-only). Lives in
`KavachCallOverlay.kt`, triggered from `KavachCallScreeningService.onScreenCall`.

**Rules / why:**
- **On-device data only.** The caller number is never sent to the server — risk
  styling is driven solely by the synced local blocklist (`ScreeningStore.isBlocked`).
  The marketing-site mockup shows rich scam-report stats; those require a server
  lookup we deliberately avoid for privacy, so the live card shows number +
  blocklist status + "Unknown caller" only. Don't add a network lookup of the
  caller without an explicit privacy decision.
- **Needs `SYSTEM_ALERT_WINDOW`** ("Display over other apps"). This is the one
  exception to the old "no sensitive permission" framing — call screening still
  avoids READ_CALL_LOG / READ_PHONE_STATE / READ_SMS (Play-sensitive). Overlay
  permission is requested transparently in the screening screen.
- **Still never blocks/answers calls** (responds with empty `CallResponse`). The
  overlay is a top banner (FLAG_NOT_FOCUSABLE | FLAG_NOT_TOUCH_MODAL) so the
  system answer/decline controls below stay usable.
- **No call-end signal** (that needs READ_PHONE_STATE, forbidden) → dismiss via a
  40s auto-timeout + a Dismiss button. Approximation of Truecaller's behavior.
- **Overlay drawn without the JS bridge.** The service may run with no RN context
  alive, so the card is pure Kotlin/WindowManager on the main-thread Handler;
  localized en/hi via a `language` pref synced into `ScreeningStore`.
- **Graceful fallback:** if overlay permission is missing, behavior degrades to
  the old heads-up notification (high-risk numbers only).

**Can't be e2e tested here** — needs a real EAS build on a device (Expo Go can't
load the native module; no way to simulate a phone call in this env). Verify via
typecheck + architect; tell the user to grant "Display over other apps".
