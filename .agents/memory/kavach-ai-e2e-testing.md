---
name: KavachAI e2e testing reaches the wrong app
description: Why runTest (Playwright) can't test the kavach-ai Expo app, and what to use instead.
---

The Playwright testing harness (`runTest`) cannot reach the kavach-ai Expo mobile app. Navigating to `/` lands on the `artifacts/admin` web app ("Netraksh Admin — Trust & Safety Console"). Even pointing it at the Expo dev domain URL with `/login` still resolves through the shared proxy to the admin app.

**Why:** Expo apps are served on a separate dev domain and bypass the shared path-based proxy, but the test harness's browser routing still funnels recognizable paths (e.g. `/login`) to the admin artifact, so login-gated mobile screens are unreachable in e2e.

**How to apply:** For visual verification of the Expo app, use the `screenshot` tool (type `app_preview`, artifact_dir_name `kavach-ai`) — it reaches the Expo dev domain correctly. It can't get past the phone+OTP login gate non-interactively, so for auth-gated mobile screens rely on: typecheck + a clean Metro bundle (a bad asset `require` path throws a bundling error) rather than runTest. Don't burn cycles retrying runTest against the Expo app.

## Expo workflow shows "failed" but Metro is actually fine

The `artifacts/kavach-ai: expo` workflow almost always shows **failed** even when Metro is healthy. The artifact uses `router = "expo-domain"` + `ensurePreviewReachable = "/status"`; that readiness probe goes through the Cloudflare-protected Expo dev domain, which blocks automated requests (the `screenshot`/external-URL tools also get a Cloudflare "you have been blocked" 403). The probe failing is a **false-negative**, not an app crash.

**Do NOT chase this as a bug.** Confirm health instead by reading the workflow log: a healthy start reaches the QR + `Metro waiting on exp://…` + `Web is waiting on http://localhost:<PORT>` idle banner with no error after. That means real devices can scan the QR in Expo Go.

Hard constraints learned the hard way (don't repeat):
- `restart_workflow` **SIGKILLs Metro when its readiness probe fails**, so right after a failed restart there is no process/socket on the port. You cannot keep Metro alive from the agent side via restart_workflow to poll/curl it.
- Manual `expo start` (nohup/setsid/background) is killed by an env guardrail (bash exits **143**, often with no output) because it binds the workflow's reserved port. The expo skill's "never run expo directly" rule is enforced. So you cannot manually run Metro to inspect it either.
- Net: don't try to curl/ss the port to prove it works — rely on the log banner + typecheck.

## Expo SDK patch drift after a task merge

Merges that add Expo native modules can leave `expo`/`expo-font`/`expo-router` (etc.) at patch versions Metro warns about ("The following packages should be updated… your project may not work correctly"). Fix by bumping the pins in `artifacts/kavach-ai/package.json` to the SDK-expected versions and `pnpm --filter @workspace/kavach-ai install`. This clears the warning but does **not** change the "failed" badge (that's the readiness-probe issue above).
