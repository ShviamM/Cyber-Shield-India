---
name: KavachAI nearby-city/state detection
description: How Home and Report resolve the user's city + state from device coordinates (nationwide).
---

The Home tab "Active Scams in {City}" / cyber-cell card and the Report screen's
prefilled location derive city + state from device coordinates via
`Location.reverseGeocodeAsync` in `hooks/useNearbyCity.ts`, which works anywhere
in India. The hook returns `{ city, state, status, ... }`.

**Why reverse geocoding (changed from the old fixed-metro list):**
- For an India-wide launch, snapping coordinates to the nearest of ~13 hardcoded
  metros mis-tags every unlisted town (e.g. Kanpur → Lucknow). Reverse geocoding
  resolves the actual city/state for any location.
- The platform geocoder needs network/Play services and is unsupported on Expo
  web, so the call is wrapped in try/catch with a fallback: a small
  `FALLBACK_CITIES` haversine nearest-match (offline / web only). Never delete
  that fallback — it keeps the screen from going blank.

**Cyber-cell contacts are STATE-level** (`lib/cyberContacts.ts`).
`getCyberCellContact(city, state?)` prefers the geocoded `state`, normalises it
via `STATE_ALIASES` (all 28 states + 8 UTs, incl. Delhi/NCT variants), then falls
back to `CITY_TO_STATE` for known metros. ALL 36 states/UTs now have an entry in
`STATE_CONTACTS`: 7 carry an officially confirmed state-cell landline/email; the
rest use the `national(state)` helper = the **1930** national helpline (official
MHA/I4C number valid in every state — it replaced the old per-state 155260 lines,
so it is verified, not a placeholder). **Do NOT fabricate a state landline** — a
wrong emergency number is worse than the 1930 fallback. Upgrade a state to a
specific line only with a live .gov.in/.nic.in source (most state-police sites sit
behind Cloudflare and won't fetch, so confirm carefully before changing one).

**Soft-match caveat:** `cityHotspot`/`cityTrending` match the geocoded city string
against backend report data; spelling variants (Bengaluru vs Bangalore) just yield
no city hotspot/scams (graceful empty), not an error. If a Hindi-locale device
returns a Devanagari state name, the contact card simply hides.
