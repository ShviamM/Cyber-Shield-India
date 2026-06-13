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

**Resolved:** the medium severity weight is now **40** (was 30), so a lone
`medium` signal scores exactly 40 and lands in the `medium` band (>= 40). A
single community-`medium` phone reputation now warns the user, matching product
intent. This closed a measured phone F1 regression vs. the legacy rule.

**Why 40 (weight) instead of lowering the medium threshold to 30:** bumping the
weight is surgical — it only changes single/stacked-`medium` behavior. Lowering
the threshold would also start flagging triple-`low` stacks (3×12 = 36), risking
new false positives. The two risk scales still don't auto-align, so the rule of
thumb stands: severity weights, not `computeRiskLevel`, decide the verdict band.

**Still true:** `computeRiskLevel` "medium" only becomes engine "medium" because
the weight was tuned to match the threshold. A `low` signal (12) alone still
can't reach `medium`; you need a `medium`/`high` signal or stacking. Don't change
`computeRiskLevel` alone to move a verdict band.

**How to apply:** re-run the eval harness
(`pnpm --filter @workspace/api-server run eval`) after any weight/threshold
change and confirm per-type F1 and overall precision don't regress.

## A lone "high" signal lands in MEDIUM by design (corroboration required)

`high` weight is **55**, but the high verdict band is **>= 70**, so a single
`high` signal alone fuses to `medium`; it reaches `high` only when a second
signal (any `medium`+, or stacked) corroborates it. This is intentional, not a
bug — reviewers (and the architect) will read "high severity → high verdict" and
flag it as broken. It is the same deliberate threshold tuning as the medium=40
choice: the engine wants corroboration before the top band. Consequence to keep
in mind: a moderator-`verifiedScam` phone, a lone brand-impersonation URL
heuristic, and a lone AI `url_ai`/`message_ai` "high" each surface as `medium`
on their own. **Do NOT "fix" this by bumping `high` to 70 or adding a
lone-high→high override** unless the product explicitly wants single-source top
warnings — it changes phone/URL/message/UPI verdicts globally. If you ever do,
re-run the eval harness.

**Why:** correctness-over-coverage — single-source signals (one model, one
heuristic) are kept advisory; the top "high" band is reserved for corroborated
risk to limit false alarms.
