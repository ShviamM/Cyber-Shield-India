---
name: Expo native modules crash web preview at import time
description: Why custom native modules must be loaded optionally, or the whole web/Expo Go preview goes blank.
---

# Native modules must load optionally, or web preview crashes

Custom Expo native modules (e.g. the on-device `KavachScreening` call/SMS module)
exist only in a native Android dev build — never in web preview, iOS, or Expo Go.

**Rule:** load them with `requireOptionalNativeModule(...)` (returns `null` when
absent), NOT `requireNativeModule(...)` (throws at import time).

**Why:** `requireNativeModule` throws *during bundling/module-eval*, not at call
time. Because the module is imported transitively at app startup (module →
lib/screening.ts → AppContext → routes), that throw aborts evaluation of every
route, so Metro reports "Route is missing the required default export" for all of
them and the web preview renders blank. A runtime `Platform.OS !== "android"`
guard does NOT help — the crash happens before any guard runs.

**How to apply:** any new custom native module should use the optional loader and
have its JS wrapper gate calls behind an `isSupported()` check + try/catch. The
wrapper can cast the optional result back to the non-null module type since
unsupported platforms never reach a call site. (Separately, JS-level native libs
like expo-share-intent are disabled via `Constants.appOwnership === "expo"` in
app/_layout.tsx — same goal, different mechanism.)
