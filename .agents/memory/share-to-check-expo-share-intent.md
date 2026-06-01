---
name: Share-to-check via expo-share-intent
description: Durable constraints for delivering ACTION_SEND shares into the kavach-ai mobile checker.
---
Share-to-check (text/link shared from another app opens the Verify tab prefilled + auto-runs) uses `expo-share-intent`, a native-module config plugin.

**Expo Go can't load the native module.** Disable it in Expo Go (the workspace preview) or the preview crashes/blocks; gate on whether running in Expo Go. Only dev/production builds exercise the real path, so it can't be verified at runtime in this environment — verify via a prebuild + native run on a device.
**Why:** the preview is Expo Go; an unconditional native call breaks it.

**Post-login navigation race (the subtle bug):** a deferred share and the auth-gate redirect both want to navigate on the first authenticated render. If the auth effect's default "go to home tab" redirect runs after the share navigation, it silently clobbers the Verify route and the payload is already cleared → share lost.
**How to apply:** give the pending share priority inside the auth-gate redirect itself (don't rely on a separate effect ordering), and dedupe with a ref that is only cleared once you've fully left the auth group — otherwise the default redirect re-fires over the just-routed share.

Let the plugin own the Android ACTION_SEND intent filter; don't also declare a manual SEND filter in app.json (duplicate share target). Keep the VIEW scheme filter for deep links.
