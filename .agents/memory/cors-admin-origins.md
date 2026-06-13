---
name: Admin console CORS allowlist (ADMIN_ORIGINS)
description: Login fails with 500 "Origin not allowed by CORS" when the browser's origin isn't in ADMIN_ORIGINS — every domain the admin SPA is served from is a distinct origin.
---

The API locks browser CORS to `ADMIN_ORIGINS` (comma-separated). The cors
middleware throws "Origin not allowed by CORS" → **500** for any browser request
whose `Origin` header isn't listed. Requests with no Origin (mobile, curl,
server-to-server) are always allowed, so curl probes pass even when a browser
fails — reproduce CORS by sending an explicit `-H "Origin: https://..."`.

**Gotcha:** even *same-origin* POSTs send an `Origin` header and are checked, so
the serving domain itself must be in the allowlist. And a deployed admin SPA is
typically reachable from **multiple** domains — the custom domain
(`netraksh.com`, `www.netraksh.com`) **and** the platform default
(`*.ondigitalocean.app`). Each is a separate origin; list every one users might
load the console from, or login 500s on the missing ones.

**Why:** symptom is "login does nothing / shows an error" with 500s in the API
log reading `Origin not allowed by CORS`; the password/DB/token path is fine.

**How to apply:** set `ADMIN_ORIGINS` to all admin-facing origins (custom +
platform default). It's an env-only fix — update the spec and redeploy, no code
change.

**Note:** the public website is now also a browser API consumer (the `/check`
scam-lookup page calls `/api/check`). It shares the root origin with the admin
console (admin lives at `/admin` subpath, website at `/`), so it's covered by
the same allowlist — no extra origin needed. Caveat: the screenshot tool hits
the app via `http://localhost:80`, which is NOT allowlisted, so API calls 500
under the screenshot tool even though the real Replit-dev-domain preview works
(200). Verify website→API calls with an explicit `Origin: https://<dev-domain>`
curl, not the screenshot tool.
