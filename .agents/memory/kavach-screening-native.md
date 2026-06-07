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

**Cannot be compiled/tested in this environment** — only the user's EAS dev
build links Kotlin. Verify here only via `kavach-ai` typecheck + a clean Metro
bundle (JS unaffected by the native files). Always tell the user to EAS-build to
actually exercise it. The role-request promise resolves via `OnActivityResult`
(request-code filtered) and is also resolved false if `startActivityForResult`
throws.
