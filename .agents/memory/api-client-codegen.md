---
name: API client codegen staleness
description: When @workspace/api-client-react is missing an operation function that the OpenAPI spec defines.
---
The generated client (`lib/api-client-react/src/generated/`) is produced by orval
from `lib/api-spec/openapi.yaml`. It can drift: `api.schemas.ts` may contain a
new type (e.g. `FraudVerdict`) while `api.ts` lacks the matching operation
function (e.g. `fraudCheck`) and URL helper. Symptom: TS2305 "no exported member
'fraudCheck'" even though the spec clearly defines the operation.

**Fix:** `cd lib/api-spec && pnpm run codegen` (runs orval + `typecheck:libs`).
Regenerates both api.ts and api.schemas.ts.

**Why:** schemas and operations are emitted to separate files; a partial/stale
generation (or an edit that only refreshed schemas) leaves them out of sync.

**How to apply:** before wiring a newly-added endpoint into an artifact, confirm
the operation function exists in `generated/api.ts`; if not, run codegen first.

## Editing index re-exports needs a dist rebuild for consumers
The package's `exports` map points at `src/index.ts` (so Vite/runtime see edits
instantly), but consumer artifacts **typecheck via TS project references**, which
read the package's emitted `dist/*.d.ts`, not src. So adding a new re-export to
`lib/api-client-react/src/index.ts` (e.g. exporting `ApiError` from
`custom-fetch`) compiles at runtime but fails the artifact's `typecheck` with
TS2305 until you rebuild declarations: `npx tsc -b lib/api-client-react/tsconfig.json`.
**Why:** package tsconfig is `composite`+`emitDeclarationOnly`; `tsc -p ... --noEmit`
in the artifact does not rebuild referenced projects, it just consumes stale d.ts.

## Overriding query options requires an explicit queryKey
When you pass a `query: {...}` options object to a generated `useGetXxx` hook
(e.g. to set `refetchInterval`/`enabled`), TypeScript requires `queryKey` too
(TanStack Query v5 `UseQueryOptions` shape). Symptom: TS2741 "Property 'queryKey'
is missing". Fix: import and call the generated `getGetXxxQueryKey(params)` and
pass it in the same `query` object. The admin app uses this exact pattern.
