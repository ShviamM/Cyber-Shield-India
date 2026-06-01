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
