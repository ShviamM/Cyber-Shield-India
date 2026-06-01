---
name: KavachAI nearby-city detection
description: Why Home "scams in your city" matches coordinates to a fixed city list instead of reverse-geocoding.
---

The Home tab "Active Scams in {City}" feature derives the city from device
coordinates by picking the nearest of a small hardcoded list of metros
(haversine), NOT from `Location.reverseGeocodeAsync`.

**Why:**
- Scam data (LIVE_THREATS, CITY_HOTSPOTS) is hardcoded client-side with no
  backend; only a fixed set of cities have data. Nearest-coords matching
  guarantees the detected city always has data to show.
- `reverseGeocodeAsync` is unsupported on Expo web; coord-only matching works
  on both web and native (getCurrentPositionAsync uses navigator.geolocation
  on web).

**How to apply:** If you add/remove cities, keep the city list in
hooks/useNearbyCity.ts in sync with the city strings in constants/data.ts
(LIVE_THREATS.city / CITY_HOTSPOTS.city) or the match will render an empty
section. Hyderabad intentionally has a hotspot but no LIVE_THREATS entry —
the empty-city fallback text covers that case.
