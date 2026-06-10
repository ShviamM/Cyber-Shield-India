---
name: KavachAI incoming-call alert (native overlay, JS fallback)
description: How the Play-safe incoming-call alert + post-call prompt are architected and the constraints that must hold
---

# Incoming-call alert architecture

**Primary path = native WindowManager overlay.** On an incoming call the
`CallScreeningService` draws `KavachCallOverlay` (a `TYPE_APPLICATION_OVERLAY`
card built programmatically) directly — no React Native cold-start, so it shows
instantly over the dialer / lock screen. The only permission this needs is
`SYSTEM_ALERT_WINDOW` ("Display over other apps"), which is Play-safe.

**Fallback = full-screen-intent notification → React `app/call-alert.tsx`.**
`KavachCallOverlay.show()` returns a Boolean; the service falls back to the
notification when the overlay either can't draw (permission missing) OR fails to
attach at runtime (OEM restriction / bad window state). Never short-circuit on
`canDraw()` alone — a failed `addView` would otherwise leave the user with a
silently-screened call and NO visible alert. `show()` is exact on the main thread
(the service path); off-main it posts best-effort and self-cleans on failure.

**Reputation is fetched in two places, by design:** the native overlay uses
`KavachReputation.kt` (off-thread HTTP, main-thread callback); the React fallback
screen uses `useCheckNumber` in JS. Risk band (not raw reportCount) drives the
red/amber/green theme. Overlay buttons (Answer/Block/Report/Dismiss) act on the
live call; it NEVER auto-answers or auto-blocks; 60s auto-dismiss.

## Non-negotiable rules (these were code-review P1s — keep)

- **Never auto-block on reputation.** Reputation only warns. The ONE exception is
  a number the user EXPLICITLY added to their blocklist → `setDisallowCall +
  setRejectCall + setSkipNotification`. This is the only no-tap action; the
  `screening.privacy.neverBlocks` copy and the manifest/service docs MUST disclose
  it (don't claim "never blocks at all"). No extra permission for the auto-reject.
- **Honesty for the non-risky headline:** only show "No scam reports" when
  `rep && reportCount === 0`. Reported-but-low-risk → caution; lookup
  failed/unknown/disabled → "couldn't verify — stay cautious". Never show a
  reassuring line on an error or a reported number.
- **Call control needs ANSWER_PHONE_CALLS** (TelecomManager accept/end via
  `KavachTelecom.kt`) — a documented exception in play-permissions-policy.md: a
  call-CONTROL perm, disclosed at Play review, NOT a restricted Call Log / SMS
  perm. Still never add READ_CALL_LOG / READ_SMS / READ_PHONE_STATE / RECORD_AUDIO.

## Post-call "How was this call?" prompt (Play-safe)

True call-END detection is impossible without Play-banned perms, so the prompt is
foreground-driven, not call-state-driven. Two sources feed the pending record:
(a) the user tapping Answer in the alert, and (b) `ingestNativePending()` pulling
the latest call the native overlay screened. `_layout.tsx` calls
`ingestNativePending()` BEFORE `getPendingPostCall()` on background→active.
Constraints: emergency/short codes skipped; ingest is idempotent (native record
cleared on read, only overwrites JS pending when newer); a foreground transition
≠ call ended, so `evaluatePending` is tri-state ("show"|"clear"|"defer") and
"defer" must KEEP the record (too-soon SETTLE_MS, or feature toggled off) so it
can still fire within the window — clearing on every eval drops legit prompts.

## Reliability extras

- **Battery optimization is RECOMMENDED, not required:** `screening.tsx` shows a
  card (when `!isIgnoringBatteryOptimizations`) that opens
  `ACTION_IGNORE_BATTERY_OPTIMIZATION_SETTINGS` — no restricted permission. Keeps
  the service alive under aggressive OEM Doze.
- **`showWhenLocked`/`turnScreenOn` on MainActivity** via config plugin
  `plugins/withCallScreenManifest.js` so the notification fallback can wake a
  locked/dozing device.

## Testing

Kotlin can't compile here and the native auto-launch needs a real EAS device build
(no call simulation; Expo web preview is proxy-blocked). Verify via kavach-ai
typecheck + architect code_review.
