---
name: EAS build needs MSG91 OTP vars inlined in eas.json
description: Why OTP breaks in EAS APK/AAB builds and where the client MSG91 vars must live
---

EAS builds run on Expo's servers, NOT on Replit, so Replit Secrets / dev-shell
env vars are invisible to them. Client config only reaches a build if it's either
(a) inlined in `eas.json` `build.<profile>.env`, or (b) set as EAS server-side
environment variables for the profile's `environment` (preview/production).

`EXPO_PUBLIC_MSG91_WIDGET_ID` and `EXPO_PUBLIC_MSG91_TOKEN_AUTH` are the MOBILE
widget values; without them in the build, `isOtpAvailable()` is false and OTP
login silently fails in the APK ("not configured"), even though dev works.

**Why / how to apply:** prefer inlining these (and the RevenueCat EXPO_PUBLIC_
keys) directly in `eas.json` env, NOT only in EAS server-side environments —
EAS env vars do NOT migrate when the Expo account/owner changes (moving to a new
owner like `shviam` leaves the new account's environments empty, so OTP/RevenueCat
regress). These are client-public values (they ship in the bundle), so committing
them to eas.json is acceptable; the real secret MSG91_AUTH_KEY stays server-side
on DigitalOcean and must never go in the build. After any account/owner change,
re-verify with `eas env:list <env>` and check eas.json has the EXPO_PUBLIC_MSG91_*
keys in every build profile.
