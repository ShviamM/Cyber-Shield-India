---
name: API horizontal scaling
description: What must be true before running the Netraksh API on more than one instance.
---

The API can run multiple instances, but two pieces of shared state gate it.

**Rate limiter** (`artifacts/api-server/src/lib/rate-limit.ts`) is Redis-backed when
`REDIS_URL` is set (atomic INCR+PEXPIRE fixed window, key prefix `rl:`), else a
per-process in-memory `Map`. `hitRateLimit` is **async** — every caller must `await`
it. On a Redis error it falls back to in-memory (degraded, per-instance) instead of
crashing; it does NOT fail-closed.

**Why:** per-IP limits (OTP/SMS-cost abuse, admin-login brute force) only work if all
instances count against one store. With `instance_count > 1` and no Redis, each
instance counts separately, so a limit of N effectively becomes N×instances.

**How to apply:** before raising `.do/app.yaml` `instance_count` above 1, provision a
DO Managed Valkey and set `REDIS_URL` (`rediss://…`) + `REDIS_TLS_NO_VERIFY=true`
(DO uses a private CA). The spec already sets `instance_count: 2`/`basic-s` for api,
so REDIS_URL is required there. Also set `DB_POOL_MAX` (default 10 per instance) —
total Postgres connections = instance_count × DB_POOL_MAX, must stay under the
managed-Postgres limit (add PgBouncer if you outgrow it).

**Note:** `ioredis` bundles fine in the esbuild build (pure JS; the externalized
`hiredis` is a different, optional native client and not used).
