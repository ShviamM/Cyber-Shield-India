---
name: Fetching EAS build status/logs + native compile gotcha
description: Poll EAS builds via GraphQL; what EAS_BUILD_UNKNOWN_GRADLE_ERROR really means
---
**Rule:** poll EAS builds via the GraphQL API, not `eas build:view --json` (the CLI is slow and times out >120s).

POST `https://api.expo.dev/graphql`, header `Authorization: Bearer $EXPO_TOKEN`:
- status/result: `{builds{byId(buildId:$id){status error{errorCode message} artifacts{applicationArchiveUrl}}}}`
- raw phase logs: `{builds{byId(buildId:$id){logFiles}}}` → a GCS signed URL (expires ~15min).

**Why it matters:** `errorCode == EAS_BUILD_UNKNOWN_GRADLE_ERROR` is almost always a real native (Kotlin) compile failure at the "Run gradlew" phase, NOT an infra flake. Kotlin compile errors (wrong arity, unresolved refs, missing deps) NEVER surface in TS typecheck, so any newly-written `.kt` is unverified until a real EAS build passes that phase.

**How to apply:** when a build hits that error, diagnose by reading the native `.kt` sources for signature/arity mismatches and missing module deps. Don't bother decoding `logFiles` offline — the content is EAS's proprietary/encrypted format (not gzip/zstd/brotli, no readable strings). Treat a green "Run gradlew" as the only proof the native module compiles.
