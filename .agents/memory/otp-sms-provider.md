---
name: OTP login via MSG91 OTP Widget
description: How OTP login works — MSG91 OTP Widget (approach B) sends+verifies on MSG91's side; backend validates the access-token.
---

Login uses the **MSG91 OTP Widget** (approach B). The mobile app drives the
whole OTP exchange against MSG91 directly via the RN SDK
(`@msg91comm/sendotp-react-native`): `OTPWidget.initializeWidget(widgetId,
tokenAuth)` → `sendOTP({identifier})` (identifier = phone WITHOUT a leading
"+", e.g. `91XXXXXXXXXX`) → `verifyOTP({reqId, otp})` → returns a JWT at the
top-level hyphenated key `access-token`. The backend never sees the OTP; it only
validates that access-token via MSG91 `POST /api/v5/widget/verifyAccessToken`
(header `authkey`, body `{ "access-token", widgetId }`) and issues our own
opaque session. verifyAccessToken success → `data.mobile = "91XXXXXXXXXX"`,
normalized to `+91…`.

Backend auth endpoints: `POST /auth/check-phone {phone} -> {isNewUser}` (so the
app can collect name/location for new users first) and `POST /auth/verify-token
{accessToken, fullName?, location?} -> AuthResponse`. The client-sent phone is
NOT trusted for identity — the phone comes from the validated token.

**Why:** When asked to "use MSG91" the user was offered (A) MSG91 as
delivery-only behind our self-managed OTP vs (B) MSG91's OTP Widget that
sends+verifies on MSG91's side. The user first chose A, then explicitly switched
to B and accepted that the widget needs a native dev build (won't run in Expo Go
or web preview). The earlier self-managed path (lib/otp.ts, lib/sms.ts,
otp_codes table, request-otp/verify-otp) was fully removed.

**How to apply:**
- MSG91 returns HTTP 200 even on logical failures, so verifyAccessToken must
  check `payload.type === "error"` (and the presence of `data.mobile`), not just
  the status code.
- Required server env: `MSG91_AUTH_KEY` (account auth key, server-only secret),
  `MSG91_WIDGET_ID`. Client env (kavach-ai): `EXPO_PUBLIC_MSG91_WIDGET_ID`,
  `EXPO_PUBLIC_MSG91_TOKEN_AUTH` — these are PUBLIC widget creds, embedded in the
  app, NOT secrets.
- Abuse model: OTP send now goes client→MSG91, so server-side send throttling no
  longer exists; only check-phone/verify-token are per-IP rate-limited. MSG91's
  own widget anti-abuse owns send throttling — a conscious tradeoff of approach B.
- Load the native SDK with a guarded lazy `require` (try/catch) + an
  `isOtpAvailable()` gate so Expo Go / web preview don't crash.
