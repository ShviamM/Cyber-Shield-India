---
name: Testing/screenshotting the kavach-ai Expo app
description: The mobile app is served from the Expo dev domain, not the proxy root; the proxy root is a different app.
---

# The Expo app lives on the Expo dev domain, not proxy "/"

When using `runTest` (Playwright) or any browser navigation against the
`kavach-ai` mobile app, navigate to the FULL Expo dev domain
(`https://$REPLIT_EXPO_DEV_DOMAIN/...`), NOT the proxy root `/`.

**Why:** path-based routing maps `/` to the `admin` web artifact (previewPath
"/"). A test that logs into `/` lands in the admin console, and a normal mobile
user fails its `isAdmin` gate ("Access Denied") — looks like an auth bug but is
just the wrong app. Expo apps bypass the shared proxy entirely.

**How to apply:** in test plans, pass the full Expo URL and tell the agent not
to use the proxy root. The `screenshot` app_preview tool already resolves the
Expo app correctly via `artifact_dir_name: "kavach-ai"`; the gotcha is only for
raw URL navigation in tests.
