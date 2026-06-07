---
name: Production DB schema is migrated manually (DO managed Postgres)
description: Prod DB schema can drift from dev because migrations aren't auto-applied on deploy; how to inspect and fix.
---

The DigitalOcean App (`netraksh`) connects to a DO **managed** Postgres cluster
`netraksh-db` (db name `defaultdb`). Dev/Replit uses a **separate** local Postgres
(`DATABASE_URL` host `helium` / `heliumdb`). They are NOT the same database.

**Why this bites:** schema changes (new drizzle columns/tables) get applied to the
dev DB during development but there is **no automatic migration step on DO deploy**,
so the prod `defaultdb` silently drifts. A query selecting a not-yet-added column
throws `column "X" does not exist` → unhandled 500 on every request that hits that
SELECT. Real case: `subscriptions.trial_started_at` missing in prod made
`getEffectiveSubscription` (and thus `/api/subscription` + `/api/subscription/trial`)
500 in prod while working fine in dev.

**How to inspect/fix (no secrets printed):**
```
DBID=$(doctl databases list --format ID,Name --no-header | grep netraksh-db | awk '{print $1}')
URI=$(doctl databases connection "$DBID" --format URI --no-header)   # never echo $URI (has password)
psql "$URI" -tAc "select column_name from information_schema.columns where table_name='subscriptions' order by 1;"
psql "$URI" -c "ALTER TABLE <t> ADD COLUMN IF NOT EXISTS <col> <type>;"   # additive, idempotent, safe
```
To find ALL drift, dump `table.column` lists from `$DATABASE_URL` (dev) and the prod
`$URI`, then `comm -23 dev prod`. After fixing, no redeploy is needed — the running
prod code already references the column; the DB just needed to catch up.

**How to apply:** whenever a deployed feature works in dev but 500s in prod, suspect
prod schema drift first; pull DO `api` runtime logs (`doctl apps logs <appId> api
--type run`) for the `_DrizzleQueryError` / `does not exist` message before touching code.
