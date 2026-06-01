---
name: Drizzle raw aggregate value types
description: Raw sql aggregate expressions return driver strings, not mapped column types
---

# Drizzle raw aggregate value types

A raw `sql<...>\`max(${table.tsColumn})\`` (or any raw aggregate) has no column
type mapping, so the pg driver returns the value as a **string**, not a `Date` —
even though you can annotate the generic as `Date`. The generic is a compile-time
cast only; it does not transform the runtime value.

Writing that string straight back into a Drizzle timestamp column throws
`value.toISOString is not a function` at query-build time.

**Why:** Hit in KavachAI reputation recompute — `max(created_at)` came back as a
string and broke the reputation upsert.

**How to apply:** Coerce raw aggregate timestamp results before reuse:
`agg.last ? new Date(agg.last) : null`. Type the generic as `string | null` to
make the coercion obvious.
