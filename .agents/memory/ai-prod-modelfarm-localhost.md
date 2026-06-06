---
name: AI broken on external hosts (modelfarm localhost)
description: Why Replit AI Integrations fail once the app is deployed off-Replit (e.g. DigitalOcean), and how to make AI work there.
---

# Replit AI Integrations don't work off-Replit

The Replit-managed AI integrations (`@workspace/integrations-openai-ai-server`,
`@workspace/integrations-gemini-ai`) build their client from `AI_INTEGRATIONS_OPENAI_*`
and `AI_INTEGRATIONS_GEMINI_*` env vars. On Replit these BASE_URLs point at
`http://localhost:1106/modelfarm/{openai,gemini}` — a **local proxy sidecar that only
exists inside the Replit container**.

**Why:** Netraksh's prod runs on DigitalOcean App Platform, not Replit Deployments.
The DO app had all four `AI_INTEGRATIONS_*` vars set, but the BASE_URLs were the
localhost modelfarm URLs, so every AI call fails to connect (nothing listens on
:1106 on DO). The fraud engine then returns the signal "AI message analysis is
unavailable; used embedded-link checks only" and text-only scams come back
`riskLevel: unknown`. URL/heuristic checks still work; AI classification does not.

**How to apply:** Copying the Replit `AI_INTEGRATIONS_*` values to an external host is
useless — the BASE_URL is localhost and the keys are modelfarm tokens. To get AI on an
off-Replit host you must use a real third-party key:
- OpenAI: set `OPENAI_API_KEY` to a real key AND clear/override `AI_INTEGRATIONS_OPENAI_BASE_URL`
  + `AI_INTEGRATIONS_OPENAI_API_KEY` (the wrapper prefers AI_INTEGRATIONS_* over OPENAI_*; baseURL falls
  back to `OPENAI_BASE_URL` then the real api.openai.com default).
- Gemini: set `AI_INTEGRATIONS_GEMINI_BASE_URL=https://generativelanguage.googleapis.com`
  and `AI_INTEGRATIONS_GEMINI_API_KEY` to a real Google AI Studio key (the gemini wrapper
  hard-requires both vars).
- Diagnose fast: `POST /api/check {"type":"message","value":"<text-only scam, no link>"}` —
  prod returns `unknown` (AI down) while Replit dev returns a real category+confidence.
