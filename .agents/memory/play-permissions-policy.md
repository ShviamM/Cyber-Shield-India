---
name: Play permissions policy (kavach-ai)
description: Which restricted Android permissions the app must NOT request, and why, to pass Google Play review.
---

# Google Play permissions policy for the Netraksh (kavach-ai) app

The app requests ONLY: `POST_NOTIFICATIONS`, `CAMERA`, `ACCESS_COARSE_LOCATION`,
`ACCESS_FINE_LOCATION`. Do not re-add `READ_PHONE_STATE`, `READ_CALL_LOG`,
`RECEIVE_SMS`, or `RECORD_AUDIO`.

**Why:**
- `RECEIVE_SMS` / SMS auto-reading is a near-certain Play rejection (restricted
  permission with a high declaration bar) and was never natively implemented.
  Replaced by an in-app "share-to-check" flow (user shares a suspicious SMS into
  the app from their Messages app) which needs no SMS permission.
- Native call screening uses the `CallScreeningService` ROLE
  (`requestCallScreeningRole`), which does NOT require `READ_CALL_LOG` or
  `READ_PHONE_STATE`. So those add policy risk with no functional benefit.
- `RECORD_AUDIO` was unused.

**How to apply:**
- If a future request asks to "read SMS automatically" or "access call log",
  push back: it needs a Play Permissions Declaration and likely fails review.
  Prefer share-to-check (SMS) and the screening role (calls). Only pursue the
  declaration if the user explicitly accepts that risk.
- Account deletion is in-app: `DELETE /me` (auth-gated, cascades all user FK rows)
  + a two-step confirm in profile; on sign-out/delete AppContext also wipes
  device-local history/prefs (kv_checks etc.) via an authenticated->unauthenticated
  reset effect. This satisfies Play's account-deletion requirement.
