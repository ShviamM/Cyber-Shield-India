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

**DO deploy-timing trap:** the website component uses a generic `git:` source (`repo_clone_url`),
NOT a `github:` source. `deploy_on_push` is INVALID for generic git sources (spec validation rejects
the field), so pushes to GitHub do NOT auto-deploy. After Replit auto-commits/pushes a code change to
GitHub (happens at turn end), you must manually run `doctl apps create-deployment <app-id>` to pick it
up. A deploy triggered before the push builds stale code.

**`doctl apps spec validate` quirk:** it validates as if creating a NEW app and rejects the existing
encrypted `EV[...]` secret values ("secret env value must not be encrypted before app is created").
Use `doctl apps update <id> --spec <file>` directly — it preserves existing encrypted secrets and
encrypts new plaintext values.
