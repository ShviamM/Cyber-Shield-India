---
name: EAS build archive size / .easignore
description: Why EAS uploads were 300MB+ and the .easignore gotcha that replaces .gitignore
---

# EAS Build archive bloat & `.easignore`

EAS preview/production Android builds were uploading a **303 MB** project
archive. Cause: large files committed at the **repo root**, not in the mobile
app — a ~150 MB `exports/*.tar.gz` source dump, ~110 MB `attached_assets/`
(uploaded zips/PDFs/videos/images), and website `public/videos/*.mp4`. None of
these are needed to build the Expo app.

**Fix:** a `.easignore` at the git root excluding `exports/`,
`attached_assets/`, `**/public/videos/`.

**Gotcha (critical):** when a `.easignore` file exists, EAS Build **ignores
`.gitignore` entirely** — it is a replacement, not additive. So `.easignore`
MUST also re-list everything `.gitignore` normally excludes (`node_modules`,
`dist`, `.expo`, `.cache/`, `.local/`, etc.) or the archive balloons (root
`node_modules` alone is ~970 MB) and may upload stray untracked files.

**Why:** large archives slow every build (upload + fingerprint) and risk
including secrets in `.local/`. Excluding `dist` is safe because prior
successful builds already excluded it via `.gitignore` — @workspace deps are
consumed as source / rebuilt on EAS servers, not from committed `dist`.

**How to apply:** keep `.easignore` a superset of `.gitignore` plus the heavy
non-mobile assets; never let it drop `node_modules`/`dist`/`.expo`/`.local`.

> To actually RUN `eas build` from the main agent (the `.git/index.lock` sandbox
> block + `GIT_OPTIONAL_LOCKS=0` fix, why NOT to move `.easignore` out or use
> `EAS_NO_VCS=1`), see `eas-build-main-agent-git-lock.md`.
