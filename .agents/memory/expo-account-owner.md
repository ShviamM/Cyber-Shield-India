---
name: Expo owner account for kavach-ai
description: Which Expo account/keystore owns the kavach-ai EAS project, and the Play-update implication.
---

# Expo owner / EAS project for kavach-ai

The live Google Play app was built under Expo owner **`netraksh`**, projectId
`93d7ef97-d9e3-4800-ba22-0f81cdd6eef2` — that project holds the **signing keystore that
matches the Play listing**.

Per user request ("push to shviam"), app.json `owner` was switched to **`shviam`** with a
NEW EAS project `e5d1313b-c177-4200-96df-82bfce6d97ee`, which gets its **own auto-generated
keystore**. APKs from the shviam project install/share fine but **cannot update the existing
Play listing** (different signing key).

**Why:** the shviam token had no access to the netraksh project, so building there required a
new project; that means a new keystore.

**How to apply:** to build something that can UPDATE the live Play app again, restore
`owner: "netraksh"` + projectId `93d7ef97-…` in app.json and use a token with netraksh
access (add shviam to the netraksh org, or use a netraksh/robot token). Don't assume the
current shviam build is Play-update-compatible.
