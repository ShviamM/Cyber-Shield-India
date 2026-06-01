---
name: Fraud engine fusion vs. reputation risk scales
description: Why the engine's phone riskLevel is weaker than the raw computeRiskLevel rule — a cross-module scale mismatch to watch when tuning.
---

The fraud engine has **two different risk scales** that do not line up, and this
surfaced clearly when building the evaluation harness.

- `computeRiskLevel()` (reputation.ts) returns `high/medium/low/unknown`
  directly from community-report counts/recency.
- The engine (`fraud-engine.ts`) does NOT use that level as the final verdict.
  It maps the level to a single `phone_reputation` **signal severity**, then runs
  `fuse()` over severity *weights* (info 0, low 12, medium 30, high 55) with
  verdict thresholds high ≥70, medium ≥40, low ≥15.

**Consequence:** a lone `medium` reputation → one weight-30 signal → fuse score
30 → falls in the `low` band (15–39) → the engine reports **low**, i.e. it
does NOT flag a number that the raw reputation rule calls `medium`. So the
engine is *more conservative* about phones than the legacy reputation rule when
reputation is the only signal.

**Why it matters:** when tuning fusion thresholds or weights, remember that a
single medium/low signal alone can never reach the engine's `medium` band — you
need either a `high` signal (55) or multiple stacked signals. Don't assume
`computeRiskLevel` "medium" == engine "medium".

**How to apply:** if the product wants a single community-`medium` phone to warn
the user, either bump the phone medium signal weight or lower the medium
threshold — changing `computeRiskLevel` alone won't do it. Re-run the eval
harness (`pnpm --filter @workspace/api-server run eval`) to measure any such
change.
