---
name: Netraksh Play data disclosure (location)
description: Why the privacy policy + Play Data Safety must declare Location, and how to verify a live website deploy
---

# Netraksh data disclosure for Google Play

**Rule:** the Netraksh mobile app **transmits approximate device location to the
backend** (Home calls `useUpdateMyLocation()`; `useNearbyCity.ts` reverse-geocodes
coords) to show nearby cyber-cell contacts + local scam alerts. So Location is
*collected data*, not on-device-only — the website privacy policy AND the Play
**Data Safety** form must both declare it (Location → Approximate, purpose "App
functionality", not shared).

**Why:** a mismatch between actual behavior, the privacy policy, and the Data
Safety form is a common Play rejection / enforcement trigger. The policy
originally listed only account/protection/device data and omitted location.
Note this is distinct from the call-overlay privacy copy — don't blanket-claim
"on-device only" anywhere location leaves the device.

**How to apply:** the website's legal copy lives in
`artifacts/website/src/data/legalContent.ts` as HTML strings under BOTH `en` and
`hi`. Edit both languages together whenever app data collection changes, and keep
the Data Safety form in lockstep.

## Verifying a live website deploy (don't trust the screenshot)

netraksh.com is a Vite **SPA on DigitalOcean App Platform** (app `netraksh`,
id `3bdc8b59-ca6f-45df-95ac-6afc972bcab9`), generic-git source → no
deploy-on-push. Release = push to GitHub `main`, then
`doctl apps create-deployment <app-id>` (DIGITALOCEAN_ACCESS_TOKEN in env), poll
`get-deployment ... --format Phase` until ACTIVE.

Legal text is bundled into `/assets/*.js`, so a **curl of the page returns only
the SPA shell** and the **screenshot tool / CDN can show stale content even after
the deploy is ACTIVE**. Authoritative check: fetch the entry JS from a fresh
`index.html`, follow chunk refs, and grep the unique string (e.g. "approximate
device location") across the chunks. That confirms what shipped regardless of
edge/screenshot caching.
