---
name: Expo local-module native source excluded by gitignore
description: Why the call-screening feature was absent from every EAS build despite working JS
---

# Custom Expo module native source silently dropped from EAS builds

The incoming-call screening feature never appeared in ANY installed APK even
though the JS, permissions, and onboarding UI were all present and the build
"finished" successfully.

**Root cause:** `artifacts/kavach-ai/.gitignore` had an **unanchored**
`android/` (and `ios/`) line — meant to ignore the root prebuild dir, but
unanchored it matches `android/` at *any* depth, including the custom local
Expo module `modules/kavach-screening/android/`. So the Kotlin service,
overlay helper, `AndroidManifest.xml`, and `build.gradle` were untracked.
EAS Build archives from the **git tree** by default, so the native side was
never uploaded/compiled. The module degrades gracefully
(`requireOptionalNativeModule` → null → `isAvailable()` false), so nothing
errored — the feature was just absent.

**Fix:** anchor the patterns to the package root — `/android/`, `/ios/` — and
add `modules/**/android/build/` + `modules/**/android/.cxx/` to keep native
*build output* ignored while tracking module *source*.

**Why it matters / how to apply:** for any local Expo module with native code,
verify `git ls-files modules/<name>/android` is non-empty. A "finished" EAS
build is NOT proof the native module shipped. Note: a `.easignore` (filesystem
tar, ignores git tracking) will include untracked files and can mask this — but
the real repo fix is anchoring the gitignore so git-archive builds work too.
