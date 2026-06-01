---
name: Brand vs technical IDs (Netraksh)
description: The product brand is "Netraksh" but technical identifiers stay "kavach-ai". Which is which, and why, so nobody re-renames the IDs.
---

# Brand "Netraksh" vs technical IDs "kavach-ai" (rename DONE)

The product-wide rename has been executed. Durable split that future work must respect:
**user-facing brand = "Netraksh"; all hidden technical identifiers stay `kavach-ai`.**
Do not "finish" the rename by changing technical IDs — that split is intentional and user-approved.

User-approved decisions (do not re-litigate without new input):

- **Scope:** Renamed only user-facing/brand text + metadata. KEPT hidden technical
  identifiers as `kavach-ai`.

## Renamed (user-facing) — these now say "Netraksh"
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
  wired into the deep-link/share-to-check flow (verify.tsx); changing breaks
  existing links and must be coordinated separately.
- No Android/iOS store bundle ID is set yet, so no store identity to disrupt.
- DB seed (artifacts/api-server/src/lib/seed.ts) has NO brand references.

## Verify after rename
- `rg -i kavach` returns only the intentionally-kept technical identifiers above.
