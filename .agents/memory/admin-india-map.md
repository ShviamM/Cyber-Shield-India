---
name: Admin India choropleth map
description: How the India fraud heatmap on the admin fraud-map page is built and why.
---

The admin India fraud map renders from **precomputed static SVG path data**, not a runtime map library.

**Rule:** To draw an India (or any) choropleth, decode a states topojson and project it to SVG paths at build time, emit a plain TS data file (code/name/d + viewBox), and render `<path>` elements colored by data. Do not add react-simple-maps/d3-geo to the app bundle.

**Why:** Keeps the app dependency-free and offline-safe; a pnpm-workspace root `installLanguagePackages` for d3 tooling failed, and a static file is smaller/simpler than shipping a map lib + topojson loader. Pure-Python topojson decode + Mercator projection works fine (no Node geo deps needed).

**How to apply:**
- Generation: decode topojson arcs (delta-encoded; apply transform scale/translate; negative arc index = reversed `~i`), Mercator-project lon/lat, fit to a viewBox, round coords, write `INDIA_STATES`/`INDIA_VIEWBOX`.
- Data→geography matching: match report rows to map shapes by **state code first**, then normalized-name fallback. The base topojson uses **TS for Telangana** but report data uses **TG** — keep a `{ TS: "TG" }` alias. Shapes with no data render neutral grey.
- Visual verify without auth: build an SVG from the generated paths and `magick`/`convert` it to PNG, then view the PNG (the admin screenshot path is gated behind login).
