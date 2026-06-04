---
name: MSG91 OTP Widget diagnosis
description: How to diagnose "could not send the code" / verify 401 by hitting MSG91 directly, and what the response codes mean.
---

# Diagnosing MSG91 OTP Widget failures from the server

The widget send/verify happens client→MSG91 directly, so our api-server logs only
show `/auth/check-phone` and `/auth/verify-token` — never the actual OTP send. To
tell whether a failure is MSG91-side or client-side, call MSG91 directly with node
(env vars are in the runtime; never print secret values):

- **Send** (RN SDK contract): `POST https://control.msg91.com/api/v5/widget/sendOtpMobile`
  body `{ widgetId, tokenAuth, identifier }` (identifier = country code + number, no `+`).
  Success → `{"type":"success","message":"<reqId>"}` (the reqId is in `message`).
- **Verify token** (backend contract): `POST https://api.msg91.com/api/v5/widget/verifyAccessToken`
  header `authkey: <MSG91_AUTH_KEY>`, body `{ "access-token", widgetId }`.

**Response code discriminator** (both return HTTP 200 with `type:"error"`):
- `code:"201"` `AuthenticationFailure` → the **authkey is wrong/invalid**.
- `code:"418"` `AuthenticationFailure` → authkey is **valid**, but the access-token is
  bad/expired/junk. So a real-OTP verify giving 418 means the token the client posted
  was invalid (client-side bug or expiry), not an authkey problem.

**Why:** distinguishes a misconfigured server secret from a client posting a bad token,
which otherwise look identical (both surface as a 401 from our `/auth/verify-token`).

**How to apply:** when a user reports send/verify failures, run the two probes above.
If send returns `success` and verify gives 418 for junk tokens, the backend is healthy
and the bug is client-side. Note: mobile (Expo Go / web preview) can't run the native
widget at all (returns the `otpUnavailable` path), so OTP only works in a dev build.

viewEnvVars does NOT surface user-set secrets (MSG91_AUTH_KEY, RAZORPAY_*) — they only
appear via the runtime `process.env`, so check presence with node, not viewEnvVars.
