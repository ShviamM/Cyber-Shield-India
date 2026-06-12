---
name: Expo project that owns the kavach-ai Play upload key
description: Which EAS project/keystore matches the Google Play upload certificate, and which one is a dead end.
---

# Which Expo keystore matches the Play listing (kavach-ai / Netraksh)

Google Play (app package `com.kavachai.com`) has a **registered upload
certificate** with SHA1 `BA:E1:6E:17:A1:13:FA:63:F6:00:F7:4B:49:D8:83:D8:21:2C:CF:62`.
Any production AAB MUST be signed with the keystore that produces that cert, or
Play rejects it ("signed with the wrong key").

## Where that key actually lives (verified via Expo GraphQL)
It is the **shviam** EAS project's auto-generated Android keystore:
- Expo account/owner: `shviam`
- projectId: `e5d1313b-c177-4200-96df-82bfce6d97ee` (@shviam/kavach-ai)
- Stored in EAS under applicationIdentifier **`com.kavachai.app`** (from the
  versionCode 1–3 builds, before the package was renamed to `.com`)
- type JKS, sha1 = `bae16e17…` ✅

The standard `EXPO_TOKEN` (shviam) can read/pull it — **no netraksh access needed.**

## Dead end: the netraksh project
The `netraksh` project (projectId `93d7ef97-d9e3-4800-ba22-0f81cdd6eef2`) has a
DIFFERENT keystore (sha1 `c5b0d3cb…`) that does NOT match the Play upload cert.
An earlier version of this note claimed netraksh held the matching key — that was
**wrong**. Do not spend effort getting a netraksh token to "recover" the key.

## How to build a Play-compatible AAB
The keystore is stored in EAS under `com.kavachai.app`, but the current package is
`com.kavachai.com`, so EAS won't auto-attach it. Use **local credentials** (which
are package-agnostic — they just sign the bytes):
1. Pull the keystore from EAS via the Expo GraphQL API (exact query in
   android-package-and-signing.md) into `artifacts/kavach-ai/credentials/keystore.jks`.
2. Write its keystorePassword/keyAlias/keyPassword into `credentials.json`.
3. `credentialsSource: "local"` on the production profile → build.
Verify sha1 == `bae16e17…` before trusting the build. The user must BACK UP this
keystore + password (local creds are not in git).
