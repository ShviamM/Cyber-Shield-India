---
name: Production secrets live on DigitalOcean, not Replit
description: Where netraksh.com production config actually lives and how to change it
---

netraksh.com is hosted on **DigitalOcean App Platform**, not Replit Deployments
(`getDeploymentInfo()` returns isDeployed:false). The committed `.do/app.yaml` is
a template with REPLACE_ME placeholders and is stale vs the real app (it omits the
`website` service); the live app has 3 services: api, admin, website.

**Rule:** Production secrets (RAZORPAY_KEY_ID/SECRET/WEBHOOK_SECRET, MSG91_AUTH_KEY,
ADMIN_PASSWORD, AI keys, SESSION_SECRET) are **app-level** envs on the DO app, type
SECRET. Replit Secrets only configure the dev environment — changing them does NOT
affect netraksh.com.

**Why:** A user reported "Razorpay stuck in test mode on the live site." Setting
live keys in Replit Secrets fixed only dev; prod stayed on test keys until the DO
app-level secrets were updated.

**How to apply (update a prod secret + redeploy):**
1. `GET /v2/apps?per_page=50` (Bearer DIGITALOCEAN_ACCESS_TOKEN), find app name "netraksh" (id 3bdc8b59-ca6f-45df-95ac-6afc972bcab9).
2. DO returns SECRET values as encrypted `EV[1:...]` refs — keep those untouched so other secrets are preserved; only overwrite the value of the keys you're changing (keep type:SECRET, DO re-encrypts plaintext on PUT).
3. `PUT /v2/apps/{id}` with `{spec}` — a spec update auto-triggers a deployment (cause "app spec updated"), even though git-push does not auto-deploy.
4. Poll `/v2/apps/{id}/deployments?per_page=1` until phase ACTIVE (full 3-service Docker build takes several minutes). Verify `https://netraksh.com/api/healthz` = 200.
