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

**Gotcha — a checkpoint rollback can silently delete `.easignore`.** A Replit
"Restored to <hash>" checkpoint reverted the working tree to a state before
`.easignore` existed, so it vanished with no diff in the current task. The heavy
assets (`attached_assets/` ~112 MB, `artifacts/website/public/videos/` ~21 MB)
are git-TRACKED, so without `.easignore` the archive balloons to ~234 MB. ALWAYS
verify `.easignore` exists at the git root before an EAS build; if missing,
restore the proven version with `git show <commit>:.easignore` (don't hand-roll
the superset — it's easy to forget a line and pull in `node_modules`/`.local`).

## Triggering builds from the Replit sandbox — EAS_NO_VCS=1 + EAS_PROJECT_ROOT

`eas build` defaults to archiving from the git tree, which writes
`.git/index.lock`. The bash sandbox blocks ALL `.git/index.lock` writes as a
"destructive git operation" (exit 254) — this hits the default build AND any
`git add`/`git commit`, in BOTH the main env and an isolated task env. So
`requireCommit:true` (which would use read-only `git archive HEAD`) is a
dead-end too: you can't commit the eas.json change to enable it.

**The trap with plain `EAS_NO_VCS=1`:** the no-VCS client archives
`process.env.EAS_PROJECT_ROOT ?? process.cwd()` (see eas-cli
`build/vcs/local.js` `getRootPath`). Run from `artifacts/kavach-ai`, it tars
ONLY the app subdir (~1.4 MB) — the root `pnpm-lock.yaml`/`pnpm-workspace.yaml`
and `lib/api-client-react` (workspace:*) are missing, so EAS falls back to
`yarn install --frozen-lockfile` and the build fails at install.

**Fix (verified):** set the archive root to the monorepo while keeping cwd at
the app dir:
```
cd artifacts/kavach-ai
EAS_NO_VCS=1 EAS_PROJECT_ROOT=/home/runner/workspace \
  eas build --platform android --profile preview --non-interactive --no-wait
```
`EAS_PROJECT_ROOT` is used ONLY by `getRootPath` (not config discovery), and
EAS computes the app's subdir as `path.relative(rootPath, projectDir)` →
`artifacts/kavach-ai`, so the builder cd's there correctly. Result: a ~66 MB
full-monorepo archive (root pnpm-lock present → pnpm detected), `.easignore`
honored, zero git ops → guard never fires. Auth via `EXPO_TOKEN`. `preview`
profile = APK; `--no-wait` returns the build URL (~20 min build).
Note: `npx eas-cli` can hang — call the `eas` binary on PATH (v14.7.1).

**Now encoded as a one-click script:** `pnpm --filter @workspace/kavach-ai run
build:android` runs exactly this invocation (`EAS_NO_VCS=1
EAS_PROJECT_ROOT=$(git rev-parse --show-toplevel) eas build --platform android
--profile preview --non-interactive`). It blocks until the build finishes; add
`--no-wait` manually if you only want to verify the upload size / get the URL.
Requires `EXPO_TOKEN`. Verified upload = 66.2 MB.

**Play Store needs the PRODUCTION profile (AAB), not preview (APK):** the
`preview` profile sets `android.buildType=apk` (internal sideload/testing only —
the Play Console rejects APKs for new apps). The `production` profile has NO
buildType, so EAS defaults to **app-bundle (AAB)**, which is what Play requires.
Use `pnpm --filter @workspace/kavach-ai run build:android:prod` (same EAS_NO_VCS
invocation but `--profile production`). Production also has `autoIncrement:true`
+ `appVersionSource:remote`, so versionCode is bumped on EAS servers per build.
Don't tell a user to upload the preview APK to the Play Store.
