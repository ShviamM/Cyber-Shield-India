# [Project name]

_Replace the heading above with the project's name, and this line with one sentence describing what this app does for users._

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/kavach-ai run build:android` — build a fresh Android APK of the mobile app via EAS (preview profile). Requires `EXPO_TOKEN`. Prints a build URL when queued; the finished APK is downloadable from that URL (or from `eas build:list --platform android` / the Expo dashboard) after ~20 min.
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

_Populate as you build — short repo map plus pointers to the source-of-truth file for DB schema, API contracts, theme files, etc._

## Architecture decisions

_Populate as you build — non-obvious choices a reader couldn't infer from the code (3-5 bullets)._

## Product

_Describe the high-level user-facing capabilities of this app once they exist._

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

_Populate as you build — sharp edges, "always run X before Y" rules._

- **Share-to-check needs a dev/production build, not Expo Go.** The mobile app
  (`artifacts/kavach-ai`) receives `ACTION_SEND` text shared from WhatsApp/SMS/browsers
  via `expo-share-intent` (a native module config plugin in `app.json`). Expo Go can't
  load the native module, so it's disabled there (`Constants.appOwnership === "expo"`)
  and the preview keeps working unchanged. To verify share-to-check:
  `pnpm --filter @workspace/kavach-ai exec expo prebuild --no-install --clean` then
  `expo run:android` (or `run:ios`), install on a device/emulator, then in another app
  use Share → Netraksh. The shared text opens the Verify tab prefilled and auto-runs.
  Routing lives in `app/_layout.tsx` (`useShareIntentRouter`), reusing the verify
  screen's existing `q`/`kind` route-param prefill.
- **iOS dev builds with `expo-share-intent` v5 need `patch-package`** (per the package's
  README — patches the `xcode` package during prebuild). Android needs no patch. If an
  iOS prebuild fails with "Config sync failed … xcodeproj … reading 'path'", add the
  upstream `xcode+3.0.1.patch` and a `postinstall: patch-package` script before building.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
