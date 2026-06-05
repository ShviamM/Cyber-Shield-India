---
name: Azure content filter on Replit-managed OpenAI
description: Why AI calls intermittently fail with 400 content_filter and how the scam classifier handles it
---

# Replit-managed OpenAI routes through Azure's content-safety filter

The Replit-managed OpenAI integration (AI_INTEGRATIONS_OPENAI_*) is Azure-backed.
Azure applies a prompt-side content-safety filter that can reject a request with
HTTP 400, `code: "content_filter"`, e.g. `sexual { filtered:true, severity:"high" }`.

**Two non-obvious traps:**
1. The rejection can fire on **our own prompt**, not the user input. The scam
   classifier's system prompt + a seeded category literally named `sextortion`
   ("Sextortion / Blackmail") tripped the sexual filter, silently disabling AI
   for *normal* messages (surfaced as "AI message analysis is unavailable").
2. The filter **false-positives on benign user text** too (e.g. "Hi mom, running
   late for dinner" was flagged sexual=high). So you cannot infer a verdict from
   a content_filter hit — labeling all filtered messages as sextortion mislabels
   innocent ones.

**How we handle it (lib/ai-classifier.ts):**
- Keep filter-tripping terms out of the prompt. Reworded system prompt; send a
  neutral alias for the `sextortion` category and map the model's answer back to
  the real DB key (CATEGORY_PROMPT_ALIAS / ALIAS_TO_REAL_KEY) so stored taxonomy
  is unchanged.
- On `content_filter` rejection: degrade gracefully (return null → non-AI
  heuristics), log at warn (expected limitation, not an error). Never fabricate a
  verdict from a filter hit.

**Why:** correctness over coverage — a false "this is sextortion" accusation is
worse than "AI unavailable, used heuristics".

**How to apply:** any new AI prompt on this gateway must avoid explicit
sexual/violent trigger terms in static text; treat content_filter as a graceful
no-op, and alias-map any taxonomy term that names such content.
