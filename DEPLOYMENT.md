# Deploying Netraksh outside Replit

This guide covers running Netraksh on any third-party host (your own server, AWS,
GCP, Render, Railway, Fly.io, DigitalOcean, etc.). The project is a pnpm monorepo
with three deployable pieces:

| Piece            | What it is                    | Where it runs in production            |
| ---------------- | ----------------------------- | -------------------------------------- |
| `api-server`     | Express REST API (Node.js)    | Any Node host / container              |
| `admin`          | React (Vite) static dashboard | Any static host / CDN behind a proxy   |
| `kavach-ai`      | Expo (React Native) mobile app| Apple App Store / Google Play via EAS  |

> The mobile app talks to `api-server`, and the admin dashboard talks to
> `api-server`. **Deploy the API first**, then point the app and admin at it.

---

## 0. Prerequisites

- **Node.js 24** and **pnpm** (`corepack enable` gives you pnpm).
- A **PostgreSQL 16** database.
- An **MSG91** account (Auth Key, a DLT-approved flow Template ID, and an
  approved Sender ID) for OTP login SMS. For India, the template and sender must
  be DLT-registered.
- (Optional) An **OpenAI API key** for the AI scam classifier. Without it, the
  fraud engine still works using its non-AI signals.
- (Optional) A **Google Safe Browsing** API key for URL reputation checks.

Install dependencies once from the repo root (enable pnpm via Corepack first):

```bash
corepack enable
pnpm install
```

---

## 1. Database

Set `DATABASE_URL` to your Postgres connection string, then create the schema
(Drizzle "push" creates tables from the schema — no migration files needed):

```bash
DATABASE_URL='postgres://USER:PASSWORD@HOST:5432/netraksh' \
  pnpm --filter @workspace/db push
```

Run this again whenever the schema changes.

---

## 2. API server (`api-server`)

### Environment variables

See `artifacts/api-server/.env.example` for the full list. The essentials:

| Variable             | Required | Notes                                                     |
| -------------------- | -------- | --------------------------------------------------------- |
| `NODE_ENV`           | yes      | `production`                                              |
| `PORT`               | yes      | Port to listen on (many hosts inject this)               |
| `DATABASE_URL`       | yes      | Postgres connection string                               |
| `SMS_PROVIDER`       | yes      | `msg91`                                                   |
| `MSG91_AUTH_KEY`     | yes\*    | Your MSG91 Auth Key                                       |
| `MSG91_TEMPLATE_ID`  | yes\*    | DLT-approved MSG91 flow Template ID                       |
| `MSG91_SENDER_ID`    | no       | Approved Sender ID (often baked into the template)        |
| `MSG91_OTP_VAR`      | no       | Template variable name for the code (defaults to `OTP`)   |
| `OPENAI_API_KEY`     | no       | Enables AI scam classification                            |
| `OPENAI_BASE_URL`    | no       | Defaults to `https://api.openai.com/v1`                   |
| `ADMIN_PHONES`       | no       | Comma-separated admin phone numbers (Indian format)      |
| `GOOGLE_SAFE_BROWSING_API_KEY` | no | Enables Safe Browsing URL checks                     |

\* Required when `SMS_PROVIDER=msg91` (the default in production).

> **Note:** The app generates and verifies its own OTP codes; MSG91 is used only
> to deliver the code via its Flow API to a DLT-approved template. The template
> must contain a variable (default name `OTP`) where the code is injected. AI uses
> Replit's managed OpenAI gateway on Replit, or your own `OPENAI_API_KEY` off
> Replit. No code changes needed.

### Build & run

```bash
pnpm --filter @workspace/api-server build   # bundles to artifacts/api-server/dist/index.mjs
pnpm --filter @workspace/api-server start    # runs the bundle (reads PORT)
```

Health check: `GET /api/healthz` → `{"status":"ok"}`. All API routes are under
`/api` (`/api/auth/*`, `/api/reports/*`, `/api/numbers/*`, `/api/check/*`,
`/api/admin/*`, `/api/stats/*`).

---

## 3. Admin dashboard (`admin`)

The admin is a static Vite SPA that calls the API at **same-origin** `/api/...`.
So serve it behind a reverse proxy that forwards `/api` to the API server
(an example nginx config is in `artifacts/admin/nginx.conf`).

Build (the Vite config needs `PORT` and `BASE_PATH` at build time):

```bash
PORT=5000 BASE_PATH=/ pnpm --filter @workspace/admin build
# Output: artifacts/admin/dist/public  (upload to any static host / CDN)
```

Use `BASE_PATH=/admin/` instead if you host it under a subpath.

---

## 4. Mobile app (`kavach-ai`)

The mobile app is **not** deployed to a server — it ships to the app stores via
Expo Application Services (EAS):

1. Install the EAS CLI and sign in: `npm i -g eas-cli && eas login`.
2. Point the app at your deployed API by setting `EXPO_PUBLIC_API_DOMAIN` to your
   API host (no protocol), e.g. `EXPO_PUBLIC_API_DOMAIN=api.yourdomain.com`.
   The app then calls `https://<that domain>/api/...`.
3. Configure your bundle identifiers / signing in `artifacts/kavach-ai/app.json`.
4. Build: `eas build --platform all` (requires Apple Developer + Google Play
   accounts).
5. Submit: `eas submit`.

See https://docs.expo.dev/eas/ for the full store-submission workflow.

---

## 5. Docker / Docker Compose (optional, turn-key)

A `docker-compose.yml` (repo root) brings up Postgres + API + admin together.
Dockerfiles live at `artifacts/api-server/Dockerfile` and
`artifacts/admin/Dockerfile` (build context is the **repo root**).

```bash
# Provide secrets via your shell/env or an .env file next to docker-compose.yml:
#   MSG91_AUTH_KEY, MSG91_TEMPLATE_ID, MSG91_SENDER_ID, OPENAI_API_KEY, ...
docker compose up --build

# First run only — create the database schema:
DATABASE_URL='postgres://netraksh:change-me@localhost:5432/netraksh' \
  pnpm --filter @workspace/db push
```

- API → http://localhost:8080 (health: `/api/healthz`)
- Admin → http://localhost:8088

These files are a working starting point; review resource limits, TLS,
secrets management, and the Postgres password before any real deployment.

---

## 6. Production checklist

- [ ] Postgres provisioned and `pnpm --filter @workspace/db push` run.
- [ ] API server env vars set (DB, MSG91, optional OpenAI/Safe Browsing).
- [ ] HTTPS/TLS terminated in front of the API and admin.
- [ ] Admin served behind a proxy that forwards `/api` to the API server.
- [ ] `EXPO_PUBLIC_API_DOMAIN` points the mobile build at the live API.
- [ ] MSG91 template and sender ID are DLT-approved for your recipients.
