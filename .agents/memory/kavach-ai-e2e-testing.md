---
name: KavachAI e2e testing reaches the wrong app
description: Why runTest (Playwright) can't test the kavach-ai Expo app, and what to use instead.
---

The Playwright testing harness (`runTest`) cannot reach the kavach-ai Expo mobile app. Navigating to `/` lands on the `artifacts/admin` web app ("Netraksh Admin — Trust & Safety Console"). Even pointing it at the Expo dev domain URL with `/login` still resolves through the shared proxy to the admin app.

**Why:** Expo apps are served on a separate dev domain and bypass the shared path-based proxy, but the test harness's browser routing still funnels recognizable paths (e.g. `/login`) to the admin artifact, so login-gated mobile screens are unreachable in e2e.

**How to apply:** For visual verification of the Expo app, use the `screenshot` tool (type `app_preview`, artifact_dir_name `kavach-ai`) — it reaches the Expo dev domain correctly. It can't get past the phone+OTP login gate non-interactively, so for auth-gated mobile screens rely on: typecheck + a clean Metro bundle (a bad asset `require` path throws a bundling error) rather than runTest. Don't burn cycles retrying runTest against the Expo app.
