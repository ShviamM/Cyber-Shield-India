---
name: Expo Router tab re-entry nonce
description: How to re-trigger a navigation effect when navigating to an already-mounted tab route.
---

# Re-triggering effects on repeat navigation to a mounted tab

Expo Router tab screens stay mounted across navigations. An effect keyed only on
route params will NOT re-run when you `router.push` to the same tab with the same
params (params are identical, component never remounts).

**Rule:** when a navigation needs to re-run side effects on every tap (e.g. a home
quick-action that preselects a check type or opens the QR scanner on the Verify
tab), pass a changing nonce param (e.g. `ts: Date.now().toString()`) and include it
in the effect deps. Track the last-handled signature in a ref to dedupe the single
real param change.

**Why:** without the nonce, tapping "Check Link" then "Check Number" then
"Check Link" again would silently do nothing on the repeat, because the tab is
already mounted and the param value is unchanged from a prior visit.

**How to apply:** sender builds `params: { type, ts: Date.now().toString() }`;
receiver effect deps `[params.type, params.scan, params.ts]`, guarded by a
`lastActionParam` ref signature.
