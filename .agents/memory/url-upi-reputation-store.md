---
name: Url/UPI community reputation store
description: How non-phone (url/upi) scam reports are stored and fused, separate from the phone flow
---
Community reports for URLs and UPI IDs do NOT reuse the phone-keyed
fraud_reports/number_reputation tables. They live in dedicated tables
`target_reports` (per-report) and `target_reputation` (cached tally, composite
PK on targetType+targetValue) — see lib/db/src/schema/target-reports.ts.

**Why:** fraud_reports.phone is NOT NULL and phone-specific stats/hotspots/
fraud-map/admin moderation all assume a phone; generalizing it would ripple
through all of those. A parallel target store keeps the phone flow untouched.

**How to apply:**
- Public report endpoint POST /reports/public accepts { type, value } for
  phone|url|upi (legacy { phone } still works). phone -> fraud_reports +
  recomputeReputation; url/upi -> target_reports + recomputeTargetReputation.
- The reputation key MUST be normalized identically at report-time and
  check-time: normalizeUrlKey (url-analysis.ts) drops scheme/www/query/trailing
  slash; normalizeUpiKey (upi.ts) lowercases the validated VPA. The fraud engine
  echoes the RAW url as verdict.value, so always re-normalize for lookups.
- fraud-engine fuses url_reputation / upi_reputation signals via
  targetReputationSignal(); reuses computeRiskLevel for banding.
- No admin verify-UI for url/upi yet (verifiedScam column exists but nothing
  sets it). New tables need manual apply to prod (DO managed PG, no auto-migrate).
