---
name: Website→API CORS blocks the screenshot tool
description: Why screenshot/app-preview of the public website's API-backed flows 500, and how to verify them instead.
---

The api-server CORS allowlist (`config.allowedOrigins`) = `ADMIN_ORIGINS` + each `REPLIT_DOMAINS` mapped to `https://<domain>`. Requests with NO Origin header are always allowed; browser requests with an Origin must match exactly or app.ts rejects with "Origin not allowed by CORS" → surfaces as HTTP 500.

The screenshot/app-preview tool loads the website via `http://localhost:80`, so its Origin is `http://localhost` — NOT in the allowlist. Every browser POST it makes to `/api/*` therefore 500s (e.g. the /check page shows "We couldn't complete the check"). This is an environment limitation, not a bug.

**Why:** real Replit-preview users load from `https://<REPLIT_DEV_DOMAIN>`, which IS in the allowlist, so the site works for them.

**How to apply:** don't trust screenshot 500s on the public website's API flows. Verify with curl against `http://localhost:80/api/...` adding `-H "Origin: https://$REPLIT_DEV_DOMAIN"` to mimic a real browser (and `X-Forwarded-For: <ip>` to dodge per-IP daily quotas / rate limits). Note `REPLIT_DOMAIN` (singular) is unset in the bash shell; use `REPLIT_DEV_DOMAIN` or `REPLIT_DOMAINS`.
