import OpenAI from "openai";

// On Replit the AI_INTEGRATIONS_OPENAI_* vars are auto-provisioned by the
// managed OpenAI integration. For third-party hosting, fall back to the
// standard OPENAI_API_KEY (and optional OPENAI_BASE_URL, defaulting to the
// public OpenAI endpoint).
const apiKey =
  process.env.AI_INTEGRATIONS_OPENAI_API_KEY ?? process.env.OPENAI_API_KEY;
const baseURL =
  process.env.AI_INTEGRATIONS_OPENAI_BASE_URL ??
  process.env.OPENAI_BASE_URL ??
  "https://api.openai.com/v1";

if (!apiKey) {
  throw new Error(
    "OpenAI API key missing. Set AI_INTEGRATIONS_OPENAI_API_KEY (Replit) or " +
      "OPENAI_API_KEY (third-party hosting).",
  );
}

export const openai = new OpenAI({ apiKey, baseURL });
