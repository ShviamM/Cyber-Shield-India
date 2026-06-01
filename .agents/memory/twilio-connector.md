---
name: Twilio connector (Replit integration) quirks
description: How to send SMS via the Replit "twilio" connector — auth scoping, restricted key, and where credentials actually live.
---

# Sending SMS via the Replit Twilio connector

The Replit `twilio` connector (SDK `@replit/connectors-sdk`) is the only working
path to send SMS. Three non-obvious constraints:

- **Send only through the proxy.** `connectors.proxy("twilio", "/2010-04-01/Accounts/{sid}/Messages.json", {method:"POST", body: URLSearchParams})` works; the proxy injects auth server-side. Direct calls to `api.twilio.com` using the connection's `api_key`/`api_key_secret` return **401** — the key is scoped to the proxy, not for direct use.
- **The provisioned API key is RESTRICTED.** It lacks `twilio/iam/accounts/read`, so any `GET /2010-04-01/Accounts/{sid}.json` (or `/Accounts.json`) through the proxy returns Twilio error **70051** ("required permission ... is missing"). This is NOT an auth failure — do not "validate" the connector with account-read endpoints; use the actual messaging endpoint instead.
- **`listConnections()` does NOT return credentials.** The SDK's `listConnections` only gives metadata (`settings` is empty). To get `account_sid` and the verified `phone_number` (needed for the Messages URL and the `From` field), fetch directly: `GET https://${REPLIT_CONNECTORS_HOSTNAME}/api/v2/connection?include_secrets=true&connector_names=twilio` with header `X-Replit-Token: repl ${REPL_IDENTITY}` (or `depl ${WEB_REPL_RENEWAL}` in deployments). Read `items[0].settings`.

**Why:** Spent a long debug cycle getting 401s from both direct auth and the proxy before reading the proxy error body revealed 70051 (a Twilio business error, meaning auth actually succeeded). The connector works; the restricted key just can't read account metadata.

**How to apply:** When wiring SMS/OTP, get `account_sid`+`phone_number` from the include_secrets connection fetch, then POST messages through `connectors.proxy`. Surface Twilio's JSON `message`/`code` on failure (trial accounts reject unverified recipients; India needs DLT registration). The connection's default `phone_number` may be Twilio's shared sandbox number (`+14155238886`), which is not a real SMS-capable sender — a live send needs a real provisioned number.
