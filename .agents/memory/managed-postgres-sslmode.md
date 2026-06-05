---
name: Managed Postgres sslmode overrides explicit ssl
description: Why an explicit pg ssl:{rejectUnauthorized:false} can still fail TLS on managed Postgres (DigitalOcean), and the fix.
---

On managed Postgres (e.g. DigitalOcean App Platform DB bindings), the injected
`DATABASE_URL` carries `?sslmode=require`. Newer `pg` / `pg-connection-string`
treat `sslmode=require` as an alias for **verify-full**, which OVERRIDES an
explicit `new Pool({ ssl: { rejectUnauthorized: false } })` and rejects the
provider's self-signed CA chain ("self-signed certificate in certificate chain").

**Fix:** when you are explicitly controlling TLS via the `ssl` option (because
`DATABASE_CA_CERT` or `DATABASE_SSL_NO_VERIFY` is set), strip the `sslmode`
query param from the connection string so the parser can't reassert verify-full.
Apply this ONLY when one of those env vars is set, so local/Replit (neither set,
`ssl` undefined, URL untouched) stays unaffected.

**Why:** without stripping, `rejectUnauthorized:false` silently has no effect and
every DB query fails on the managed provider even though the same code works
locally. The seed/query failure is often caught and logged (app stays "healthy")
so the DB looks connected but is actually unusable.

**How to apply:** prefer `DATABASE_CA_CERT` + `rejectUnauthorized:true` for
production hardening; `DATABASE_SSL_NO_VERIFY=true` is the fallback when the CA
PEM isn't available (e.g. DO's internal connection string).
