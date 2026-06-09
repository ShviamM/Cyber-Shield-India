---
name: KavachAI Truecaller-style call overlay
description: How the incoming-call "pop" overlay is built; privacy stance is now live server lookup (reversed)
---

# Incoming-call overlay (Truecaller-style "pop")

A WindowManager `TYPE_APPLICATION_OVERLAY` card shown for EVERY incoming call.
Lives in `KavachCallOverlay.kt`, triggered from
`KavachCallScreeningService.onScreenCall`.

**Privacy stance — REVERSED to live lookup (user opt-in):**
- The earlier "on-device only, never send the caller number" rule was overturned
  by an explicit user choice ("Live lookup (Truecaller-style)"). The service now
  sends the caller's 10-digit number to `GET {apiBase}/api/numbers/{ten}/check`
  to fetch real `reportCount / riskLevel / verifiedScam / categories`.
- **Why:** the rich red demo card needs real reputation data; the user accepted
  that numbers leave the device. Don't silently revert to on-device-only.
- The card shows on-device info instantly, then `update()` swaps it in place once
  the network result arrives (guarded by `currentNumber` so a dismissed/stale
  card isn't repainted).
- **Auth token matters:** the endpoint is freemium-quota'd for anonymous callers
  but UNLIMITED with a bearer token. JS syncs base+token into `ScreeningStore`
  (`syncScreeningApiConfig` → `setApiConfig`) from `_layout.tsx` (on auth change)
  and `screening.tsx` (focus + enable). The service has no JS bridge, so it makes
  its own `HttpURLConnection` GET on a daemon thread (4s timeouts).
- **Privacy copy must stay honest:** the screening screen's `privacy.onDevice`
  string previously claimed "nothing uploaded" — that's now false for calls.
  Updated in ALL locales to "SMS screening is on-device; for calls only the
  number is checked against Netraksh's DB." `noContent` (message *contents*)
  stays true. If you touch this feature, keep that disclosure accurate.

**Theme / data rules:**
- Red "risky" theme is driven by the engine's risk BAND, not raw report count:
  `verifiedScam || riskLevel in [high, medium]` (or a local blocklist hit). A
  number with reports but `low` risk shows the calmer navy card. reportCount is
  still displayed as a stat.
- Stats are the only REAL per-number fields: reportCount, riskLevel, status
  (Verified/Reported/Clean), plus top category as a badge. The demo's
  victims/topCity are fake/hardcoded — there is no per-number source for them.

**Mechanics / constraints:**
- Needs `SYSTEM_ALERT_WINDOW`. Call screening still avoids READ_CALL_LOG /
  READ_PHONE_STATE / READ_SMS (uses the CallScreeningService role).
- **Still never blocks/answers calls** (empty `CallResponse`). The rich card is
  full-screen (`FLAG_NOT_FOCUSABLE` only, no NOT_TOUCH_MODAL) to match the user's
  full-screen design — so it covers the system answer/decline. Buttons handle it:
  Block (add to on-device blocklist), Report (deep link `kavach-ai://call-alert?number=`),
  Answer (just dismisses the overlay to reveal the real call UI). This is the
  inherent tradeoff of a full-screen takeover; the banner-style variant kept
  system controls tappable but couldn't show the rich card.
- No call-end signal (needs READ_PHONE_STATE) → 40s auto-timeout + buttons.
- Overlay is pure Kotlin/WindowManager on a main-thread Handler (no JS context);
  localized en/hi inline in Kotlin.
- Graceful fallback: no overlay permission → old heads-up notification (high-risk
  numbers only).

**Can't be e2e tested here** — needs a real EAS build on a device (Expo Go can't
load the native module; no call simulation). Verify via typecheck + architect.
