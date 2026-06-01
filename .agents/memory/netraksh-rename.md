---
name: KavachAI → Netraksh rename
description: Confirmed scope/timing decisions for the product-wide brand rename, and which identifiers must stay unchanged.
---

# KavachAI → Netraksh rename (confirmed plan, gated on V2)

User-approved decisions (do not re-litigate without new input):

- **Timing:** Run as a single clean final sweep ONLY after all V2 tasks finish
  (#26 Android screening + follow-ups #27–#32, plus any later-accepted V2
  follow-ups like #33/#34). Renaming earlier collides with in-flight isolated
  task agents, which would reintroduce "KavachAI" on merge.
- **Scope:** Rename only user-facing/brand text + metadata. KEEP hidden technical
  identifiers as `kavach-ai`.

## Rename (user-facing) — change these
- `artifacts/kavach-ai/app.json` → `expo.name` ("Netraksh — India Cyber Safety").
- All 12 mobile locale files `artifacts/kavach-ai/i18n/locales/*.ts` — brand
  strings (appName, welcomeTitle, member, aboutTitle, rateTitle, version,
  demoSub, verifiedScam, safety-tip copy). en.ts is the source of truth.
- `artifacts/admin/index.html` (title + description/og/twitter meta).
- `artifacts/admin/src/pages/dashboard.tsx` (header + restricted-access text).
- `lib/api-spec/openapi.yaml` `info.description`, then RERUN codegen
  (lib/api-spec) — do NOT hand-edit generated files in lib/api-zod &
  lib/api-client-react; they only inherit the name from the spec.
- Artifact display titles via the artifacts skill (not by editing artifact.toml):
  "KavachAI — India Cyber Safety" and "KavachAI Admin".
- Brand-relevant comments in constants/strings.ts, i18n/languages.ts.
- `artifacts/mockup-sandbox/src/components/mockups/spam-tracker/*` are CANVAS
  design mockups, not the shipping app — renaming optional; confirm if needed.

## KEEP unchanged (technical identifiers) — and why
- Artifact dir `artifacts/kavach-ai/` + package `@workspace/kavach-ai`: renaming
  reshuffles imports, workflow names, artifact registration; zero user benefit.
- `app.json` `slug` and deep-link `scheme: "kavach-ai"` (`kavach-ai://verify`):
  wired into deep-link/share handling (verify.tsx) and Task #32; changing breaks
  existing links and must be coordinated separately.
- No Android/iOS store bundle ID is set yet, so no store identity to disrupt.
- DB seed (artifacts/api-server/src/lib/seed.ts) has NO brand references.

## Verify after rename
- `rg -i kavach` returns only the intentionally-kept technical identifiers above.
