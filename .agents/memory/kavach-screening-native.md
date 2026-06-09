---
name: KavachAI native call screening module
description: How the on-device call-screening Expo module is built and why it avoids the Play Permissions Declaration.
---

# Native call screening (modules/kavach-screening/android)

The TS side (`src/KavachScreeningModule.ts`, `lib/screening.ts`) was scaffolded
with no native code; the real Android Kotlin lives under
`modules/kavach-screening/android/`. It is a local Expo module, autolinked via
`expo-module.config.json` (+ a private `package.json` with `main: index.ts`,
required for native autolinking — the pnpm workspace globs don't reach nested
module dirs, so it is NOT a workspace package).

**Compliance design (the whole point):**
- Calls use Android `CallScreeningService` + `ROLE_CALL_SCREENING` (via
  `RoleManager.createRequestRoleIntent`). This grants the call number to
  `onScreenCall()` WITHOUT `READ_CALL_LOG` / `READ_PHONE_STATE` / `READ_SMS`.
- **Because none of those restricted permissions are used, Google Play needs NO
  "Permissions Declaration" form.** That is the reason to prefer
  CallScreeningService over call-log/SMS-reading approaches.
- SMS is share-sheet based in-app (no `READ_SMS`); the module's `smsScreening`
  is state-only and `hasSmsPermission` is always false.

**Privacy promise enforced in code:** the service NEVER blocks — it calls
`respondToCall(details, CallResponse.Builder().build())` (empty = allow, no
reject/silence/skip-log) and only posts a warning notification for blocklisted
numbers. Don't "improve" it by adding `setDisallowCall(true)`.

**Background→JS events:** `KavachCallScreeningService` runs as a separate
component; it reaches JS via a static `KavachScreeningModule.current` reference
(set/cleared in OnCreate/OnDestroy) → `sendEvent`. Best-effort only (no-op when
JS runtime is dead) — the notification is the reliable path.

**Why the incoming-call popup may "not show" on a real device** — three grants
each cover a different gap; missing any one degrades the experience:
1. `ROLE_CALL_SCREENING` — without it `onScreenCall()` never fires at all.
2. `SYSTEM_ALERT_WINDOW` ("Display over other apps") — required for the
   background `startActivity` to draw the popup over an UNLOCKED phone / live
   call screen. Without it you only get a heads-up notification, not the
   full-screen card.
3. `USE_FULL_SCREEN_INTENT` — Android 14 (API 34, `UPSIDE_DOWN_CAKE`) REVOKES
   this by default for non-dialer/alarm apps, so the locked-screen full-screen
   fallback silently downgrades to a heads-up. Detect via
   `NotificationManager.canUseFullScreenIntent()` and send the user to
   `Settings.ACTION_MANAGE_APP_USE_FULL_SCREEN_INTENT`. Manifest declaration
   alone is NOT enough on 14+. The onboarding (`app/screening.tsx`) surfaces
   overlay + full-screen as required-action cards; don't drop them.
Users often assume it fails because "Call logs/Phone/Contacts not allowed" — by
design those are never requested; the real switches are the three above.

**Cannot be compiled/tested in this environment** — only the user's EAS dev
build links Kotlin. Verify here only via `kavach-ai` typecheck + a clean Metro
bundle (JS unaffected by the native files). Always tell the user to EAS-build to
actually exercise it. The role-request promise resolves via `OnActivityResult`
(request-code filtered) and is also resolved false if `startActivityForResult`
throws.
