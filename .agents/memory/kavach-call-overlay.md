---
name: KavachAI incoming-call alert (React screen, not native card)
description: On a real incoming call the native service launches the React call-alert.tsx screen; reputation is fetched in JS, not Kotlin
---

# Incoming-call alert — now a React screen

On a real incoming call the native `CallScreeningService` no longer draws a Kotlin
overlay card. It launches the full React screen `app/call-alert.tsx` (the same one
the home-screen DEMO button opens) over the lock screen via deep link
`kavach-ai://call-alert?number=<urlencoded>`.

**User-chosen behavior:** show the screen automatically — NO auto-answer. The user
still taps Answer/Block, and those buttons now ACT on the live call:
- Block → `endCall()` + `blockNumber(apiPhone)` then dismiss; Answer → `answerCall()`
  then dismiss. Both gated behind `!isDemo` so the home-screen demo is unaffected.
- These need **ANSWER_PHONE_CALLS** (TelecomManager acceptRingingCall/endCall). This
  is a deliberate, documented exception to play-permissions-policy.md — it is a
  call-CONTROL permission, NOT one of Play's restricted Call Log / SMS perms, but it
  IS call-related so it must be disclosed at Play review. Still never add
  READ_CALL_LOG / READ_SMS / RECORD_AUDIO.
- Blocking persists to the on-device blocklist; `KavachCallScreeningService` then
  **silently auto-rejects** future calls from blocked numbers (setDisallowCall +
  setRejectCall + setSkipNotification). This is the one place the app acts without a
  per-call tap — so `screening.privacy.neverBlocks` copy MUST disclose it (don't
  claim "never silently on its own"). No extra permission needed for the auto-reject.
- `dismiss()` must be `router.canGoBack() ? back() : replace("/(tabs)")` — the deep-
  link launch has no back stack, so a bare `router.back()` is a no-op.

**Setup UI (screening.tsx):** scattered status + per-permission prompt cards were
replaced by ONE guided `SetupGuide` card: ordered steps role → ANSWER_PHONE_CALLS →
notifications → overlay → full-screen, with a single CTA that runs the next missing
grant. Enabling the call toggle requests role + notifications + ANSWER_PHONE_CALLS
back-to-back; the two Settings-screen grants (overlay, full-screen) are driven by
the guide CTA.

**Native launch (KavachCallScreeningService.kt):**
- onScreenCall: if the incoming number is on the on-device blocklist → respond with
  setDisallowCall + setRejectCall + setSkipNotification (silent auto-reject) and stop.
  Otherwise respond with an empty/allow builder (never blocks) AND launch the screen.
- Two launch paths: (a) direct `startActivity` of the deep link when `canDraw`
  (overlay permission grants the background-activity-launch exemption), and
  (b) ALWAYS post a full-screen-intent notification fallback
  (`USE_FULL_SCREEN_INTENT`, added in app.json) so it still fires without overlay
  permission / on stricter OEMs.
- The service NO LONGER does the HTTP lookup or any card drawing. All the old
  lookup/overlay/prettyCategory helpers were removed.

**KavachCallOverlay.kt** is trimmed to ONLY `canDraw` (still used by the module +
service to decide the direct-launch path). All show/update/Risk/view code is gone.

**Reputation is fetched in JS now (call-alert.tsx):**
- `isDemo = no number param`. Demo keeps the canned red showcase content unchanged
  (2,341 / 892 / Mumbai, FedEx badge, rotating red warnings).
- Real caller: `useCheckNumber(apiPhone)` (enabled only when `!isDemo && apiPhone`,
  explicit `getCheckNumberQueryKey`, `staleTime: 60s`). Renders REAL stats:
  reportCount, risk band, status (Verified/Reported/Clean), top category as badge.
- **Three-state VISUAL verdict (not just headline text):** the whole overlay theme
  (accent, root bg, caller-circle icon) derives from a single `verdict`:
  `risky`=red (`verifiedScam || riskLevel in [high,medium]`, or demo),
  `clean`=green, `caution`=amber. **GREEN is reserved EXCLUSIVELY for a number we
  actually looked up with `reportCount === 0`.** A failed/slow/disabled lookup
  (rep undefined) OR reported-but-low-risk (`reportCount > 0`) → AMBER, never green.
  **Why:** previously both "unknown lookup" and "community-reported" collapsed into
  the same green/safe treatment (green shield, green accent), so a glance mid-call
  could misread an unverified caller as safe — for a scam app that's the most
  dangerous bug. Headline text mirrors this (safeHeadline only when clean;
  cautionHeadline when reported; unknownHeadline when no rep). Keep the icon as
  shield only for `clean`; `alert-triangle` for reported-caution, `help-circle`
  for unknown-caution. (Originally a code-review P1 on text; hardened to visual.)

**Dead config left in place (minor):** `ScreeningStore` apiBaseUrl/authToken and
JS `syncScreeningApiConfig` are now UNUSED by native (JS does its own fetch via the
hook). Left to minimize churn; safe to remove later.

**i18n:** new callAlert keys (riskLabel/statusLabel/risk_*/status*/safeHeadline/
cautionHeadline/unknownHeadline/checking) added to en + hi only; other ~10 locales
rely on i18next fallbackLng → en (see kavach-ai-i18n.md).

**Single-language only (no bilingual duplicate):** the popup must render in the
user's CHOSEN language only — never the selected language + an always-on English
copy underneath. An earlier design dual-rendered (a `showEnglish = language!=="en"`
flag added an English `<Text>` under the warning headline and the safety reminder);
the user explicitly rejected this ("I chose Hindi, show only Hindi"). **Why:** for a
Hindi user it looked like a bug (every line doubled). **How to apply:** rely on
`t()` + i18next fallbackLng (per-key English fallback for incomplete locales) — do
NOT reintroduce a getFixedT("en")/showEnglish dual-render for "clarity".
**Still English (separate gap, not the bilingual bug):** report-sheet category names
(`c.nameEn`) and the real-caller top-category badge (`prettyCategory(key)`) — true
localization needs `nameHi` added to the /categories API + orval regen (app-wide).

**Lock-screen display fix (showWhenLocked/turnScreenOn):** the deep link launches
Expo `MainActivity`, which by default renders BEHIND the keyguard and won't wake
the screen — so on a locked/off device the caller card never appears (the real
root cause of "popup doesn't show on lock screen"). Fixed with a local Expo
config plugin (`plugins/withLockScreenCallAlert.js`, registered in `app.json`)
that injects `android:showWhenLocked="true"` + `android:turnScreenOn="true"` onto
`MainActivity` via `withAndroidManifest` + `AndroidConfig.Manifest.getMainActivityOrThrow`.
Standard activity attributes → NO restricted permission, NO Play declaration.
Verify by running `expo prebuild` and grepping the generated
`android/app/src/main/AndroidManifest.xml` (then delete the generated `android/`
and revert prebuild's incidental `package.json` edits — the app stays managed).
**Caveat (privacy):** flags are on the shared MainActivity, so any locked launch
of it can show over the keyguard, not just call-alert. Practical exposure is low
(normal launches go through the keyguard), but the scoped hardening is a dedicated
call-alert Activity (or runtime setShowWhenLocked toggling around the call-alert
lifecycle). Other OS gates still apply: USE_FULL_SCREEN_INTENT (revoked by default
on Android 14+), SYSTEM_ALERT_WINDOW, POST_NOTIFICATIONS, OEM battery exemption.

**Can't be e2e tested here** — native auto-launch needs a real EAS device build (no
call simulation; Expo web preview is behind a proxy security block). Verify via
typecheck + architect.
