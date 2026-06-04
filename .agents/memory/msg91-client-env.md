---
name: MSG91 client env vars
description: Why MSG91 WIDGET_ID/TOKEN_AUTH live in shared env / .replit and are not true secrets.
---

The MSG91 OTP widget needs a `widgetId` and `tokenAuth` on the **client** to initialize. These are exposed via `EXPO_PUBLIC_MSG91_*` (Expo) and `VITE_MSG91_*` (web) env vars, which by framework convention are inlined into the shipped client bundles.

**Rule:** Treat `*_MSG91_WIDGET_ID` and `*_MSG91_TOKEN_AUTH` (the EXPO_PUBLIC_/VITE_ prefixed ones) as client-public config, not secrets. The only server-side secret is `MSG91_AUTH_KEY`, which is correctly kept in the secrets store.

**Why:** Generic secret scanners flag any name containing `TOKEN_AUTH` and report these committed-in-`.replit` (managed shared env) values as leaked credentials. That is a false positive for client-public widget config — it is already shipped to every client by design.

**How to apply:** Don't try to "move them out of source" — Replit persists shared env vars in `.replit`, and the client build requires them. If a reviewer/validation rejects on these, it's not fixable in app code; the only real hardening is rotating the MSG91 widget token from the MSG91 dashboard (user action). Don't delete them from shared env or OTP login breaks in dev and prod.
