---
name: KavachAI e2e testing reaches the wrong app
description: Why runTest (Playwright) can't test the kavach-ai Expo app, and what to use instead.
---

The Playwright testing harness (`runTest`) cannot reach the kavach-ai Expo mobile app. Navigating to `/` lands on the `artifacts/admin` web app ("Netraksh Admin — Trust & Safety Console"). Even pointing it at the Expo dev domain URL with `/login` still resolves through the shared proxy to the admin app.

**Why:** Expo apps are served on a separate dev domain and bypass the shared path-based proxy, but the test harness's browser routing still funnels recognizable paths (e.g. `/login`) to the admin artifact, so login-gated mobile screens are unreachable in e2e.

**How to apply:** For visual verification of the Expo app, use the `screenshot` tool (type `app_preview`, artifact_dir_name `kavach-ai`) — it reaches the Expo dev domain correctly. It can't get past the phone+OTP login gate non-interactively, so for auth-gated mobile screens rely on: typecheck + a clean Metro bundle (a bad asset `require` path throws a bundling error) rather than runTest. Don't burn cycles retrying runTest against the Expo app.

## Expo workflow shows "failed" — FIX: drop ensurePreviewReachable

Symptom: `artifacts/kavach-ai: expo` shows **failed** even though Metro is healthy (clean log, valid QR), and `restart_workflow` then tears Metro down (no process/socket afterward).

**Root cause (diagnosed by curl):** the artifact had `router = "expo-domain"` + `ensurePreviewReachable = "/status"`. That readiness probe is checked against the **public Expo dev domain** `*.expo.pike.replit.dev`, which `307`-redirects to `https://replit.com/__replshield` (Replit's access shield) instead of `200`. The probe never gets 200 → workflow marked failed → process killed. The *main* dev domain `*.pike.replit.dev` returns 200 (it's public + the other artifacts probe via the internal localhost proxy), so only Expo — which uniquely probes the shielded public domain — fails.

**Fix (worked):** remove the `ensurePreviewReachable = "/status"` line from the expo service in `.replit-artifact/artifact.toml` via `verifyAndReplaceArtifactToml` (keep `router`, `paths`, `localPort`). Readiness then = "process started," so the workflow stays **running** and Metro persists. Verified after: state `running`, `curl localhost:25528/status` → `200 packager-status:running`. The QR-based preview routing (driven by `router`/`paths`, not the probe) is unaffected.
**Why this is correct for Expo:** the mobile preview is a QR/`exp://` connection, not an embedded HTTP iframe, so an HTTP-200 reachability gate on the dev domain is the wrong health signal for this artifact.

Hard constraints (still true):
- `restart_workflow` SIGKILLs Metro when readiness fails — but with the probe removed, restart now succeeds and leaves Metro running.
- Manual `expo start` (nohup/setsid/bg) is killed by an env guardrail (bash exit **143**); never run expo directly. Use restart_workflow + read the log/curl localhost:PORT/status.

## Expo SDK patch drift after a task merge

Merges that add Expo native modules can leave `expo`/`expo-font`/`expo-router` (etc.) at patch versions Metro warns about ("The following packages should be updated… your project may not work correctly"). Fix by bumping the pins in `artifacts/kavach-ai/package.json` to the SDK-expected versions and `pnpm --filter @workspace/kavach-ai install`. This clears the warning but does **not** change the "failed" badge (that's the readiness-probe issue above).
