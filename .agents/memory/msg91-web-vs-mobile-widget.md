---
name: MSG91 web vs mobile widget split
description: Why the website and mobile app need SEPARATE MSG91 OTP widgets, and how the backend verifies tokens from both.
---

# MSG91 web vs mobile widget split

The MSG91 OTP **widget** has a "Mobile Integration" toggle. When ON, MSG91 rejects
all browser/web requests with the error **"web request are not allowed for this widget."**
The React Native SDK (mobile app) REQUIRES Mobile Integration ON; the website widget
must have it OFF. **One widget cannot serve both** → you need two widgets:
- mobile widget: Mobile Integration ON  (EXPO_PUBLIC_MSG91_WIDGET_ID)
- web widget:    Mobile Integration OFF (VITE_MSG91_WIDGET_ID)

**Why:** this is also why the admin web console uses a shared password, not OTP — the
shared widget had Mobile Integration ON and blocked web.

**tokenAuth is account-level, not per-widget.** The same `tokenAuth` (VITE_/EXPO_PUBLIC_
MSG91_TOKEN_AUTH) can be reused across widgets; only the `widgetId` changes. The account
**Authkey** (MSG91_AUTH_KEY, server secret) is a DIFFERENT thing — never put it in a
client bundle. Users routinely confuse "Authkey" with the widget "Token Auth".

**Backend verification gotcha:** `verifyAccessToken` (api-server msg91-widget.ts) sends
`widgetId` in the body and MSG91 validates the token against THAT specific widget. A token
issued by the web widget will NOT verify against the mobile widget id. So the backend must
try every configured widget id. Config: `msg91WidgetId` (mobile) + `msg91WebWidgetId`
(MSG91_WEB_WIDGET_ID, web); verify loops over both and accepts the first MSG91 confirms.

**How to apply:** when wiring website OTP, set VITE_MSG91_WIDGET_ID to the web widget,
set MSG91_WEB_WIDGET_ID (backend) to the same, reuse the existing tokenAuth, and remember
prod needs these baked into the DO build (see website-prod-vite-build-args.md).

## Headless captcha ("Invalid Captcha Token")
With `exposeMethods: true` the widget suppresses its own popup, so its captcha never
renders and `sendOtp` is rejected server-side with **"Could not send the code Invalid
Captcha Token"** (the web widget has Captcha Validation ON by default).
Fix without disabling captcha (disabling weakens SMS-cost-abuse protection):
- Pass `captchaRenderId: "<dom-id>"` in `initSendOTP` and render a `<div id="<dom-id>">`
  that is **already in the DOM** at init time. MSG91 injects **hCaptcha** (not reCAPTCHA)
  into it ("I am human" checkbox).
- The widget also exposes `window.isCaptchaVerified(): boolean` — gate `sendOtp` on it.
- Keep the captcha container **mounted** across UI steps (hide with CSS, don't unmount);
  the widget injects hCaptcha once and won't re-inject into a remounted empty div, which
  would strand the "change number"/resend flow.
- On localhost the box shows a benign "Warning: localhost detected. Please use a valid
  host." — it still works on the real domain.
