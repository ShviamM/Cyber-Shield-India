---
name: Broadcast / push delivery on Expo
description: Why admin broadcasts must also be readable via an in-app feed, not only OS push.
---
Admin "broadcasts" are sent via the Expo Push API to registered device tokens.
But Expo push tokens **cannot be obtained in Expo Go, on web, or on any device
that never registered** — so in those environments a broadcast reaches zero
recipients and shows up nowhere (the device_tokens table is empty).

**Rule:** broadcast content must also be deliverable as an in-app feed, not only
as OS push. The mobile bell icon reads `GET /notifications` (auth-required),
which returns rows from the same `broadcasts` table the admin console writes to.
This is the reliable, testable delivery path; OS push is best-effort on top.

**Why:** a user reported broadcasts "not coming in the bell"; root cause was
(a) zero registered push tokens in Expo Go/web, and (b) the bell icon was not a
notification center at all (it opened the call-alert demo).

**How to apply:** when adding any "notify all users" feature, back it with a
queryable table + a user-facing GET endpoint and an in-app surface. Treat
OS push as an enhancement, never the sole channel — and never assume push works
when testing in Expo Go or the web preview.

Unread state for the bell is tracked client-side: AsyncStorage stores the newest
broadcast timestamp the user has viewed (`kv_notif_read_at`); a broadcast is
unread when its createdAt exceeds that. Store the latest broadcast's timestamp
(not Date.now()) on read so the dot is immune to device clock skew.
