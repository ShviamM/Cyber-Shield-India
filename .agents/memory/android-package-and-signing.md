---
name: KavachAI Android package name + signing key
description: The permanent Play package name and how the upload keystore was generated without keytool
---

# Android package name + signing key (kavach-ai / Netraksh)

**Permanent Play package name = `com.kavachai.com`** (this is what the Play
Console app entry was created with; package name is immutable once published).
NOT `com.kavachai.app`. The iOS `bundleIdentifier` intentionally stays
`com.kavachai.app` (independent of Android). Don't "fix" the `.com` to `.app`
later — it looks like a typo but it's the real, locked Play identifier. The
in-app Play Store links in `app/(tabs)/profile.tsx` must use `id=com.kavachai.com`.

## Why changing the package name broke the build
Changing `android.package` in app.json makes it a NEW app to EAS, so there is no
managed (remote) keystore for it. `eas build --non-interactive` then dies with
"Generating a new Keystore is not supported in --non-interactive mode". This
headless environment cannot do interactive keystore generation: stdin isn't a TTY
("Input is required, but stdin is not readable"), and piping `yes`/`y` does NOT
work — EAS refuses non-TTY stdin for that prompt.

## How a keystore was created without keytool (no JDK installed)
keytool/java are not installed here; installing a Java toolchain just for keytool
is heavy. `openssl` IS available, so generate a PKCS12 keystore instead:
1. `openssl req -x509 -newkey rsa:2048 -nodes -days 10950` (~30yr cert).
2. `openssl pkcs12 -export -name upload -passout pass:<PW>` → `keystore.jks`.
3. **keyPassword MUST equal keystorePassword** (PKCS12 single-password limitation);
   keyAlias = the `-name` friendlyName ("upload").
4. Wire it via `credentials.json` (keystorePath/keystorePassword/keyAlias/keyPassword)
   at the artifact root, and set `credentialsSource: "local"` on the production
   profile in `eas.json`.
EAS accepted it ("Using local Android credentials (credentials.json)") and the
production AAB built + signed → FINISHED. So EAS/Android accept openssl PKCS12
keystores, not just keytool JKS.

## Security / persistence
`credentials.json` (contains the keystore password) and `credentials/keystore.jks`
are **gitignored** — they never reach GitHub, but they DO live in the workspace and
Replit checkpoints. They are local credentials, so every future production build
needs these exact files. **The user must back up the keystore + password.** If lost,
because the app uses Play App Signing, an upload-key reset can be requested from
Google — recoverable but a hassle. Long-term cleaner alternative: migrate to
EAS-managed credentials via an interactive `eas credentials` run on a real terminal.
