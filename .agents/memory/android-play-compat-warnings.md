---
name: Android Play compat warnings (edge-to-edge, large-screen orientation)
description: How the two non-blocking Google Play Android 15/16 compatibility warnings are handled in the Expo SDK 54 app.
---

# Android Play compatibility warnings (non-blocking)

Two Play Console warnings appear on upload; BOTH are warnings, not rejections — the AAB still publishes.

## 1. "deprecated APIs/parameters for edge-to-edge" (Android 15)
- Expo SDK 54 / RN 0.81 force edge-to-edge ALWAYS ON (no opt-out), so the app is already edge-to-edge compliant.
- The flagged deprecated calls (setStatusBarColor / setNavigationBarColor / setDecorFitsSystemWindows / FLAG_FULLSCREEN) come from Expo/RN/library NATIVE code (autolinked `expo-status-bar`, `expo-system-ui`, Material bottom sheets, etc.), not app JS.
- App code is already clean: uses `react-native-safe-area-context` everywhere (no RN `SafeAreaView`), imports no `StatusBar`/`expo-status-bar`/`expo-navigation-bar`.
- **Conclusion: essentially non-actionable at app level for now; don't chase it.** Removing the unused `expo-status-bar`/`expo-system-ui` deps MIGHT shave some references, but `expo-system-ui` applies app.json `userInterfaceStyle`/`backgroundColor`, so removing it is risky and unverifiable without a build.

## 2. "Remove resizability and orientation restrictions" (Android 16)
- `orientation: "portrait"` (app.json) is STILL honored on phones (< sw600dp); Android 16 only ignores it on large screens (tablets/foldables).
- Netraksh is a portrait, phone-first design, so we KEEP portrait and opt out of the large-screen behavior instead of going adaptive.
- Opt-out = inject the official manifest property into `<application>` via config plugin `plugins/withLargeScreenOptOut.js`:
  `android.window.PROPERTY_COMPAT_ALLOW_RESTRICTED_RESIZABILITY = true`
  (developer.android.com/guide/practices/device-compatibility-mode#opt_out)
- **Caveat:** this opt-out is removed at API level 37 — long-term fix is adaptive layouts.

**How to apply:** both warnings concern native/manifest output → any fix requires a NEW AAB (versionCode bump) to take effect; nothing changes until rebuilt + re-uploaded.
