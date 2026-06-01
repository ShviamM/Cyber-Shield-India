---
name: Orval codegen naming clash
description: OpenAPI response component names that collide with orval's generated operation types
---

# Orval codegen naming clash

Do not name an OpenAPI response schema component `<Operation>Response` when that
operation's `operationId` would also produce a generated type ending in
`Response`. Orval (the `@workspace/api-spec` codegen) generates an operation
response type named after the operation, and a same-named component schema
clashes, breaking codegen / producing duplicate identifiers.

**Why:** Hit during KavachAI V2 — a `RequestOtpResponse` component collided with
orval's generated `<op>Response`; renamed the component to `RequestOtpResult` to
resolve it.

**How to apply:** When authoring `lib/api-spec/openapi.yaml`, give response body
components a noun that isn't `<Op>Response` (e.g. `...Result`). Run
`pnpm --filter @workspace/api-spec run codegen` to confirm.
