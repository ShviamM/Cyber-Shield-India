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

## CRITICAL: don't generate a new keystore — the Play upload key already exists
This app's Play listing has a **registered upload key** (sha1 `bae16e17…`). A
freshly generated keystore (the openssl PKCS12 one below, sha1 `2fe5b5…`) gets
**rejected by Play** ("signed with the wrong key"). The correct key is the shviam
EAS project's existing keystore — PULL it instead of generating one.

Expo GraphQL (`POST https://api.expo.dev/graphql`, header `Authorization: Bearer
$EXPO_TOKEN`) — no keytool / no interactive `eas credentials` needed (both are
unavailable in this headless, no-TTY env):

```
app { byId(appId:"e5d1313b-c177-4200-96df-82bfce6d97ee"){ androidAppCredentials {
  applicationIdentifier
  androidAppBuildCredentialsList { androidKeystore {
    type keyAlias keystore keystorePassword keyPassword sha1CertificateFingerprint } } } } }
```

`keystore` is base64 → decode to `credentials/keystore.jks` (JKS magic `feedfeed`);
copy the password/alias fields into `credentials.json`; verify sha1 == `bae16e17…`;
build with `credentialsSource:"local"` (package-agnostic). See expo-account-owner.md.

## (superseded) How the WRONG openssl keystore was created — kept for reference
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
