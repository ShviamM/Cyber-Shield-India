---
name: OTP login via MSG91 OTP Widget
description: How OTP login works — MSG91 OTP Widget (approach B) sends+verifies on MSG91's side; backend validates the access-token.
---

Login uses the **MSG91 OTP Widget** (approach B). BOTH client apps drive the
whole OTP exchange against MSG91 directly and the backend never sees the OTP; it
only validates the resulting access-token via MSG91 `POST
/api/v5/widget/verifyAccessToken` (header `authkey`, body `{ "access-token",
widgetId }`) and issues our own opaque session. verifyAccessToken success →
the verified mobile comes back in `message` (`{ type:"success", message:"91XXXXXXXXXX" }`),
NOT in `data.mobile`; normalize to `+91…` and read `message` first (see
msg91-widget-diagnosis.md for the full code-meaning table).

- **Mobile (kavach-ai)** uses the RN SDK `@msg91comm/sendotp-react-native`:
  `OTPWidget.initializeWidget(widgetId, tokenAuth)` → `sendOTP({identifier})`
  (identifier = phone WITHOUT a leading "+", e.g. `91XXXXXXXXXX`) →
  `verifyOTP({reqId, otp})`. **The SDK returns the RAW MSG91 widget API JSON
  `{ type, message }`** (it just does `fetch().then(r=>r.json())` against
  `control.msg91.com/api/v5/widget/sendOtpMobile` / `/verifyOtp`). On success the
  **reqId AND the verify access-token both come back in `message`**, NOT in
  `reqId` / `access-token`. `type === "error"` signals failure. Parse defensively
  (`res.reqId ?? res.message`, `res["access-token"] ?? res.message`) — assuming a
  hyphenated `access-token` key made send fail with `send_failed` even though the
  OTP SMS was delivered.
- **Admin (web)** can't use the RN SDK, so it loads the web widget script
  `https://verify.msg91.com/otp-provider.js` and calls
  `window.initSendOTP({widgetId, tokenAuth, exposeMethods:true})` → exposes
  `window.sendOtp(identifier, ok, fail)`, `window.verifyOtp(otp, ok, fail, reqId?)`,
  `window.retryOtp(channel|null, ok, fail, reqId?)`. The web verifyOtp success
  payload shape is inconsistent across versions, so extract the token defensively
  (string | `access-token` | `message` | `token`). Client env is VITE_-prefixed
  (`VITE_MSG91_WIDGET_ID`, `VITE_MSG91_TOKEN_AUTH`). **`initSendOTP` config MUST
  include `success` and `failure` callbacks even with `exposeMethods: true`** —
  the widget invokes the config-level `success` from its internal flow and throws
  an unhandled `"success callback function missing !"` (crashes the page) if it's
  absent. They can be no-ops since the real flow runs through the exposed methods.

Backend auth endpoints: `POST /auth/check-phone {phone} -> {isNewUser}` (so the
app can collect name/location for new users first) and `POST /auth/verify-token
{accessToken, fullName?, location?} -> AuthResponse`. The client-sent phone is
NOT trusted for identity — the phone comes from the validated token.

**Admin web login is SEPARATE from OTP.** The admin console (artifacts/admin) does
NOT use OTP — it uses a single shared password (`ADMIN_PASSWORD` secret) via `POST
/auth/admin-login {password} -> AuthResponse`. Password is compared constant-time;
the session is bound to the canonical admin user = `config.adminPhones[0]`
(find-or-create, isAdmin=true). Mobile (kavach-ai) still uses the OTP widget. Do not
reintroduce OTP into the admin app. **Why:** the admin is a small trusted group; a
shared password is simpler than OTP for a desktop console. The admin entrypoint has
its own stricter brute-force throttle (separate from OTP tuning) since it's single-factor.

**Why:** Approach B (MSG91 OTP Widget sends+verifies on MSG91's side) was chosen
over a self-managed OTP where MSG91 is delivery-only. The tradeoff: the widget
needs a native dev build (won't run in Expo Go or web preview), and server-side
send throttling is gone — accepted deliberately. There is no self-managed OTP
fallback (no otp_codes table, no request-otp/verify-otp); don't reintroduce one.

**How to apply:**
- MSG91 returns HTTP 200 even on logical failures, so verifyAccessToken must
  check `payload.type === "error"` first, then read the mobile from `payload.message`
  (success shape), not just the status code.
- Required server env: `MSG91_AUTH_KEY` (account auth key, server-only secret),
  `MSG91_WIDGET_ID`. Client env (kavach-ai): `EXPO_PUBLIC_MSG91_WIDGET_ID`,
  `EXPO_PUBLIC_MSG91_TOKEN_AUTH` — these are PUBLIC widget creds, embedded in the
  app, NOT secrets.
- Abuse model: OTP send now goes client→MSG91, so server-side send throttling no
  longer exists; only check-phone/verify-token are per-IP rate-limited. MSG91's
  own widget anti-abuse owns send throttling — a conscious tradeoff of approach B.
- Load the native SDK with a guarded lazy `require` (try/catch) + an
  `isOtpAvailable()` gate so Expo Go / web preview don't crash.
- OTP length is set in the MSG91 widget config (dashboard), not the apps — the
  apps just mirror it. It's currently **4 digits**. Changing it means touching
  several spots in lockstep: mobile login (`length !== N` check, `slice(0, N)`,
  `maxLength={N}`), admin login (`otpSchema` min + `Input maxLength`/placeholder),
  AND the `otpSubPrefix` / `otpPlaceholder` / `invalidOtp` strings in **every**
  `i18n/locales/*.ts` (note bn.ts uses Bengali numerals, e.g. ৪ not 4).
- The RN SDK's top-level code does `NativeModules.BiometricAuth` and fires a
  `console.error("BiometricAuth is undefined! Ensure the native module is
  properly linked.")` when that optional biometric module isn't linked. We don't
  use biometrics and OTP works regardless — it's harmless noise. The try/catch in
  `getWidget()` does NOT catch it (it's a console.error, not a throw), so it shows
  as a red LogBox overlay. Silenced via `LogBox.ignoreLogs([/BiometricAuth is
  undefined/])` at app entry; don't mistake it for an OTP failure.
