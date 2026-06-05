---
name: DigitalOcean subpath routing for static SPAs
description: How to host multiple Vite SPAs under different path prefixes on one DO App Platform app (api at /api, admin at /admin, website at /).
---

When hosting several static Vite SPAs as separate components of one DO App Platform app, route them with app-level `ingress.rules` by path prefix, ordered most-specific first (`/api`, then `/admin`, then `/` catch-all).

**The strip-vs-preserve rule (non-obvious):**
- A backend that mounts its router at the prefix (Express `app.use('/api', ...)`) needs `preserve_path_prefix: true` so the container still sees `/api/...`.
- A static SPA served by nginx from root with `try_files ... /index.html` needs the DEFAULT behavior (NO `preserve_path_prefix`), so DO strips the prefix before forwarding. Pair this with the SPA's Vite `base` = the same subpath (e.g. `BASE_PATH=/admin/`).

**Why it works:** browser requests `/admin/assets/x.js` (URL comes from Vite base) → DO matches `/admin`, strips it → nginx receives `/assets/x.js` → serves from root. Deep link `/admin/login` → stripped to `/login` → try_files → index.html → client router (wouter base `/admin`) resolves it. Setting `preserve_path_prefix: true` here would 404 every asset because nginx has no `/admin/` directory.

**How to apply:** new SPA component = mirror an existing static Dockerfile (build with the right `BASE_PATH`, nginx try_files fallback) + add an ingress rule with NO preserve flag + set Vite base to the subpath. Root-served site uses `BASE_PATH=/`.
