# Fraud Engine Evaluation Harness

Offline research/QA tooling that measures the **new multi-signal fraud engine**
against the **legacy rule-based logic** on the same labeled dataset, so any
"measurable improvement" claim is backed by precision / recall / F1 / accuracy
numbers instead of intuition.

This is **not** a user-facing feature — it runs from the command line, never
from the app.

## Run it

```bash
# Deterministic run (no AI model calls — reproducible, CI-safe):
pnpm --filter @workspace/api-server run eval

# Include the live AI message classifier (non-deterministic, costs tokens):
pnpm --filter @workspace/api-server run eval --ai
```

Both commands print a report to stdout and write it to
`src/eval/REPORT.md`.

## Dataset format (`dataset.jsonl`)

One JSON object per line (JSON Lines). Fields:

| Field | Required | Description |
| --- | --- | --- |
| `id` | yes | Stable unique id. |
| `type` | yes | One of `phone`, `url`, `upi`, `message`. |
| `value` | yes | The raw input given to both classifiers. |
| `label` | yes | Ground truth: `scam` or `legit`. |
| `note` | no | Human note on why it is labeled that way. |
| `reputation` | phone only | Community-report context (see below). |

### `reputation` (phone context)

Phone risk is not intrinsic to the digits — it depends on how often the number
was reported. To keep the harness deterministic and DB-free, that context lives
in the dataset:

```json
{ "reportCount": 6, "verifiedScam": false, "lastReportedDaysAgo": 12 }
```

A number defined on a `phone` example is also reused when the same number is
embedded inside a `url`, `upi`, or `message` example (the harness builds a
reputation map keyed by the normalized E.164 number).

## How the comparison works

- **Positive class** is `scam`. A target counts as flagged when the classifier's
  `riskLevel` is `medium` or `high`. The same threshold is applied to both
  systems, so the comparison is fair.
- **Legacy (`legacy.ts`)** — flat keyword / blacklist / format rules, no scoring,
  no link-structure analysis, no reputation cross-referencing, no AI.
- **Engine (`engine.ts`)** — reuses the production analyzers (`analyzeUrlHeuristics`,
  `analyzeUpi`, `computeRiskLevel`), entity extraction, and the exact
  severity-weighted fusion from `fraud-engine.ts`. Phone reputation is injected
  from the dataset; the gated Safe-Browsing lookup is skipped (it only emits a
  zero-weight info signal in dev); the AI signal is opt-in via `--ai`.

`engine-parity.test.ts` asserts the offline adapter returns the same `riskLevel`
as the real `runFraudCheck` for the DB-free / AI-free paths, so the harness
cannot silently drift from production.

## Repeatability

The default run is fully deterministic, so re-running after an engine change
re-measures the delta with no setup. Re-run the command, commit the regenerated
`REPORT.md`, and the diff is the impact of your change.
