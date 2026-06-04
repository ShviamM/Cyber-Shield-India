---
name: MSG91 OTP Widget diagnosis
description: How to diagnose "could not send the code" / verify 401 by hitting MSG91 directly, what the response codes mean, and the success response shape.
---

# Diagnosing MSG91 OTP Widget failures from the server

The widget send/verify happens client→MSG91 directly, so our api-server logs only
show `/auth/check-phone` and `/auth/verify-token` — never the actual OTP send. To
tell whether a failure is MSG91-side or client-side, call MSG91 directly with node
(env vars are in the runtime; never print secret values):

- **Send** (RN SDK contract): `POST https://control.msg91.com/api/v5/widget/sendOtpMobile`
  body `{ widgetId, tokenAuth, identifier }` (identifier = country code + number, no `+`).
  Success → `{"type":"success","message":"<reqId>"}` (the reqId is in `message`).
- **Verify OTP** (get token): `POST https://control.msg91.com/api/v5/widget/verifyOtp`
  body `{ widgetId, tokenAuth, reqId, otp }`. Success → the JWT is in `message`
  (3-part string). The client's `res["access-token"] ?? res.message` extraction is right.
- **Verify token** (backend contract): `POST .../api/v5/widget/verifyAccessToken`
  header `authkey: <MSG91_AUTH_KEY>`, body `{ "access-token", widgetId }`. Works on both
  `api.msg91.com` and `control.msg91.com`.

**Response code discriminator** (errors return HTTP 200 with `type:"error"`):
- `code:"201"` `AuthenticationFailure` → the **authkey string is unrecognized**.
- `code:"418"` `AuthenticationFailure` → authkey is a real key but belongs to a
  **DIFFERENT MSG91 account than the widget**. It cannot validate this widget's token.
  This is the cross-account mismatch — fix by using the auth key of the SAME account
  that owns the widget.
- `code:701` `invalid access-token` → authkey **matches the widget's account**; only the
  token itself is junk/expired. Seeing 701 for a junk token is the GOOD signal that the
  authkey is finally correct.

**Proving which account owns the widget:** the verifyOtp JWT payload (base64-decode the
middle segment) contains `{ requestId, companyId }`. The `companyId` is the account that
owns the widget; `MSG91_AUTH_KEY` must be that same account's key. Decoding the token is
the hard proof of cross-account mismatch direction.

**Success response shape (the second bug):** on success `verifyAccessToken` returns
`{ "type":"success", "message":"91XXXXXXXXXX" }` — the verified mobile is in `message`,
NOT in `data.mobile`/`data.identifier`. Backend must read `payload.message` as the phone
on success (only after the `type==="error"` check, so `message` isn't an error string).

**Why:** these two failures looked identical (both surface as 401 from `/auth/verify-token`)
but had different causes: wrong-account authkey (418) AND backend reading the wrong field.

**How to apply:** when a user reports send/verify failures, run the probes above. 201/418
= authkey problem (418 specifically = wrong account; compare JWT `companyId` to the key's
account). 701 = authkey correct, look at the token/client. mobile (Expo Go / web preview)
can't run the native widget at all (`otpUnavailable` path), so OTP only works in a dev build.

viewEnvVars does NOT surface user-set secrets (MSG91_AUTH_KEY, RAZORPAY_*) — they only
appear via the runtime `process.env`, so check presence with node, not viewEnvVars.
