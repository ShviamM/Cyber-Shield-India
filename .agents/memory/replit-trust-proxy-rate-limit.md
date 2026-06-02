---
name: Replit trust proxy + per-IP rate limits
description: On Replit's proxy, Express needs `trust proxy` for req.ip to be the real client; per-phone caps alone don't stop SMS-cost abuse.
---

# Express `trust proxy` + per-IP rate limiting on Replit

Behind Replit's managed proxy, `req.ip` resolves to the proxy's address unless
`app.set("trust proxy", true)` is set. Without it, any per-IP rate limiter keys
every request under one shared IP and throttles all users together.

**Why:** OTP/SMS endpoints that only cap per-phone (hourly cap, resend cooldown,
attempt cap) still let one client spray many phone numbers — a real SMS-cost /
abuse DoS vector. The per-IP limiter is the layer that stops it, and it only
works once `trust proxy` makes `req.ip` the actual client (via X-Forwarded-For).

**How to apply:** Any time you add IP-based throttling to the api-server, ensure
`trust proxy` is on. For OTP-style endpoints, layer a per-IP window
(`hitRateLimit` in `lib/rate-limit.ts`) on top of the per-phone DB checks. Note
the in-memory limiter is single-process only — move to a shared store (Redis) if
the API is ever scaled horizontally.
