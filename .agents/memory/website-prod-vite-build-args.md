---
name: Website prod Vite build args (MSG91 OTP)
description: Why the DO-built website needs VITE_* passed as Docker build args, and why GitHub pushes don't auto-deploy.
---

# Website production Vite build args

The public website (`@workspace/website`) is a Vite SPA. Vite inlines `import.meta.env.VITE_*`
at **build time**. The site's MSG91 OTP widget (`src/lib/msg91.ts`) throws
"Phone verification is not configured." when `VITE_MSG91_WIDGET_ID` / `VITE_MSG91_TOKEN_AUTH`
are undefined.

**Why it broke in prod only:** those vars exist in the Replit env (so local dev works), but the
DigitalOcean website build had no env block, so the prod bundle shipped them as `undefined`.

**How to apply (two coordinated changes — both required):**
1. `artifacts/website/Dockerfile` must declare `ARG VITE_MSG91_WIDGET_ID` / `ARG VITE_MSG91_TOKEN_AUTH`
   and re-export them as `ENV` before `pnpm --filter @workspace/website build`. DO passes a
   component's BUILD_TIME env vars to a Dockerfile build only as `--build-arg`, so a matching `ARG`
   is mandatory or the value is silently dropped.
2. The DO app spec website component needs those keys as `scope: BUILD_TIME` envs.

**Replit→GitHub is NOT automatic:** Replit checkpoints commit locally and push to the
`gitsafe-backup` remote ONLY. They do NOT push to the connected GitHub repo (remote
`subrepl-*` → github.com/ShviamM/Cyber-Shield-India). After a checkpoint, local HEAD moves ahead
but GitHub `main` stays behind (verify with `curl -s https://api.github.com/repos/ShviamM/Cyber-Shield-India/commits/main`).
The user must push to GitHub manually via Replit's version-control pane; the main agent cannot
`git push`/`git fetch` (blocked as destructive) and there's no GitHub connector token available.
DO builds from GitHub `main`, so a deploy before the user pushes builds stale code.

**DO deploy-timing trap:** the website component uses a generic `git:` source (`repo_clone_url`),
NOT a `github:` source. `deploy_on_push` is INVALID for generic git sources (spec validation rejects
the field), so even once code is on GitHub, pushes do NOT auto-deploy — run
`doctl apps create-deployment <app-id>` manually AFTER the user pushes to GitHub.

**Verify without sending a real OTP:** fetch the live bundle and check the widget id is inlined:
`curl -s <site>/ | grep -oE '/assets/[^"]+\.js'` then grep the bundle for `$VITE_MSG91_WIDGET_ID`.
If the bundle hash is unchanged after a deploy, the build got stale code (GitHub wasn't updated).

**`doctl apps spec validate` quirk:** it validates as if creating a NEW app and rejects the existing
encrypted `EV[...]` secret values ("secret env value must not be encrypted before app is created").
Use `doctl apps update <id> --spec <file>` directly — it preserves existing encrypted secrets and
encrypts new plaintext values.
