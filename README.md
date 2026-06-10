# Netraksh — Source Handoff

**Netraksh** ("India's Digital Bodyguard") is an AI-powered fraud-prevention product for
Indian consumers: an Android mobile app, a web admin console, a marketing/account website,
and a single Express backend — all in one pnpm monorepo.

> Brand vs. technical IDs: the user-facing brand is **Netraksh**, but technical identifiers
> (directory, package name, Expo slug, URL scheme, Android package, native module) stay
> **`kavach-ai`**. Do not rename them.

## Start here — read these in order

1. **`HANDOFF.md`** — the master handoff: what each part is, what's deployed, how to run/build,
   the secrets you need, and the open issues. **Read this first.**
2. **`DEPLOYMENT.md`** — step-by-step deploy guide (Docker, DigitalOcean App Platform, EAS builds).
3. **`NETRAKSH_PRELAUNCH_AUDIT.md`** — pre-launch audit (security, payments, AI, Play Store readiness).
4. **`replit.md`** — project conventions and gotchas.

## Repository map

```
artifacts/
  kavach-ai/    Expo (React Native) Android app — THE MOBILE APP
  admin/        React + Vite admin console (moderation, KPIs, fraud map, broadcasts)
  website/      React + Vite marketing site + user account/billing (Razorpay)
  api-server/   Express 5 backend — the single API all clients talk to
  brand/        Brand assets / style reference
  mockup-sandbox/  Dev-only component preview server (not deployed)
lib/
  db/                 Drizzle ORM schema (PostgreSQL) — source of truth for the data model
  api-spec/           OpenAPI spec + Orval codegen config
  api-zod/            Generated Zod validation schemas (from the spec)
  api-client-react/   Generated React Query hooks + fetch transport
  integrations-*-ai*/ AI provider integrations
.do/app.yaml          DigitalOcean App Platform spec
docker-compose.yml    Local full-stack compose
```

## Quick start (local dev)

```bash
corepack enable && pnpm install          # Node 24, pnpm
cp artifacts/api-server/.env.example artifacts/api-server/.env   # fill in values
pnpm --filter @workspace/db push         # create the DB schema (needs DATABASE_URL)

# Run pieces (each reads PORT):
pnpm --filter @workspace/api-server run dev
pnpm --filter @workspace/admin       run dev
pnpm --filter @workspace/website     run dev
pnpm --filter @workspace/kavach-ai   run dev   # Expo

# Quality gates:
pnpm run typecheck
pnpm run build
```

## Build the mobile app (APK)

```bash
npm i -g eas-cli && eas login            # needs the Expo/EAS account
cd artifacts/kavach-ai
eas build --platform android --profile preview     # internal/test APK
eas build --platform android --profile production   # store build
```

## What is NOT in this archive (by design)

- `node_modules/` and build output (`dist/`, `.expo/`, `android/build/`) — run `pnpm install` to restore.
- **Secrets / `.env` values** — production secrets live on DigitalOcean (app-level env vars) and in the
  respective provider consoles, never in the repo. See `HANDOFF.md` §8 for the full list of secrets and
  accounts you must obtain. `artifacts/api-server/.env.example` lists the backend env keys (names only).
- Most of `attached_assets/` (agent working scratch) — only the few files the website imports are kept.

See `HANDOFF.md` §6–§9 for the full first-week checklist.
