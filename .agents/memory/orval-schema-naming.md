---
name: Orval schema naming collisions
description: How to name OpenAPI component schemas so generated zod + types don't clash
---

In `lib/api-spec`, orval generates BOTH a zod schema (from each operation, named
`<OperationId>Body` / `<OperationId>Response`) and a TypeScript type per component
schema (named exactly after the schema). `lib/api-zod/src/index.ts` re-exports both
barrels, so a component schema whose name equals an operation-derived name produces:
`Module "./generated/api" has already exported a member named '...'`.

**Rule:** never name a response component schema the same as `<OperationId>Response`.
Mirror the existing convention: operationId is verb-first (`checkNumber`,
`fraudCheck`), so name the response component noun-first (`NumberCheckResponse`,
`FraudVerdict`). Request bodies are safe — the op zod is `<OperationId>Body` while the
component type can be `...Request` without colliding.

**Why:** the collision only surfaces at `pnpm --filter @workspace/api-spec run codegen`
(which runs `typecheck:libs`), not when editing the yaml, so it's easy to miss.

**How to apply:** when adding a new endpoint, pick the response schema name first and
check it differs from `<OperationId>Response`.
