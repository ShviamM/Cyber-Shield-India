import { db, aiUsageTable } from "@workspace/db";
import { logger } from "./logger";

type CompletionUsage = {
  prompt_tokens?: number | null;
  completion_tokens?: number | null;
  total_tokens?: number | null;
} | null | undefined;

/**
 * Persist a single AI call's token usage for the Super Admin cost dashboard.
 * Best-effort: any failure is logged and swallowed so it can never affect the
 * classification it is accounting for.
 */
async function recordAiUsage(
  model: string,
  operation: string,
  usage: CompletionUsage,
): Promise<void> {
  try {
    const prompt = Math.max(0, Math.round(usage?.prompt_tokens ?? 0));
    const completion = Math.max(0, Math.round(usage?.completion_tokens ?? 0));
    const total = Math.max(
      0,
      Math.round(usage?.total_tokens ?? prompt + completion),
    );
    await db.insert(aiUsageTable).values({
      model,
      operation,
      promptTokens: prompt,
      completionTokens: completion,
      totalTokens: total,
    });
  } catch (err) {
    logger.error({ err }, "Failed to record AI usage");
  }
}

export type MessageClassification = {
  isScam: boolean;
  /** A scam-category key (must be one of the provided keys) or null. */
  category: string | null;
  /** Model confidence, 0-1. */
  confidence: number;
  /** Short English explanation of the decision. */
  rationale: string;
};

/**
 * The Replit-managed OpenAI integration auto-provisions these env vars. When
 * they are absent we skip the AI call entirely and let the engine fall back to
 * the non-AI signals, surfacing that explicitly in the verdict.
 */
export function isAiConfigured(): boolean {
  return Boolean(
    (process.env.AI_INTEGRATIONS_OPENAI_BASE_URL &&
      process.env.AI_INTEGRATIONS_OPENAI_API_KEY) ||
      process.env.OPENAI_API_KEY,
  );
}

const SYSTEM_PROMPT = `You are a fraud-detection classifier for Netraksh, an Indian cyber-safety app.
You receive a single SMS, chat, or call-transcript message and decide whether it is a scam targeting Indian consumers.
Common scams: OTP theft, fake KYC/Aadhaar/PAN updates, lottery/prize wins, loan/credit-card offers, job/work-from-home tasks, UPI/payment tricks, digital-arrest/police impersonation, electricity-bill disconnection, courier/parcel customs holds, tech support, bank/government impersonation, investment/trading guarantees, and blackmail or extortion threats.
Respond ONLY with a JSON object: {"is_scam": boolean, "category": string|null, "confidence": number, "rationale": string}.
- "category" MUST be exactly one of the provided category keys, or null if none fit or the message is not a scam.
- "confidence" is a number from 0 to 1.
- "rationale" is one short English sentence (no PII echoed back).`;

/**
 * Some category keys/names (e.g. "sextortion") contain terms that trip the
 * upstream provider's content-safety filter, which would reject the whole
 * prompt and silently disable classification. We send the model a neutral
 * alias and map its answer back to the real key, so the stored category keys
 * never change.
 */
const CATEGORY_PROMPT_ALIAS: Record<
  string,
  { key: string; name: string }
> = {
  sextortion: { key: "blackmail_extortion", name: "Blackmail / Extortion" },
};
const ALIAS_TO_REAL_KEY: Record<string, string> = Object.fromEntries(
  Object.entries(CATEGORY_PROMPT_ALIAS).map(([real, a]) => [a.key, real]),
);

type RawClassification = {
  is_scam?: unknown;
  category?: unknown;
  confidence?: unknown;
  rationale?: unknown;
};

/**
 * Classify a raw message via the Replit-managed OpenAI integration. Returns
 * null when AI is unavailable or the call fails, so callers degrade gracefully.
 */
export async function classifyMessage(
  text: string,
  categories: { key: string; nameEn: string }[],
): Promise<MessageClassification | null> {
  if (!isAiConfigured()) return null;

  const trimmed = text.trim();
  if (!trimmed) return null;

  const validKeys = new Set(categories.map((c) => c.key));
  // Substitute filter-tripping keys/names with neutral aliases for the prompt.
  const categoryList = categories
    .map((c) => {
      const alias = CATEGORY_PROMPT_ALIAS[c.key];
      return alias
        ? `- ${alias.key}: ${alias.name}`
        : `- ${c.key}: ${c.nameEn}`;
    })
    .join("\n");

  try {
    // Lazy import so a missing integration never throws at module load.
    const { openai } = await import("@workspace/integrations-openai-ai-server");

    const completion = await openai.chat.completions.create({
      model: "gpt-5-mini",
      max_completion_tokens: 8192,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: `Category keys:\n${categoryList}\n\nMessage:\n"""\n${trimmed.slice(0, 4000)}\n"""`,
        },
      ],
    });

    // Best-effort usage accounting for the Super Admin cost dashboard. Never
    // let a logging failure affect classification.
    void recordAiUsage("gpt-5-mini", "classify_message", completion.usage);

    const content = completion.choices[0]?.message?.content?.trim();
    if (!content) return null;

    const parsed = JSON.parse(content) as RawClassification;

    let rawCategory =
      typeof parsed.category === "string" ? parsed.category : null;
    // Map any neutral alias the model returned back to the real stored key.
    if (rawCategory && ALIAS_TO_REAL_KEY[rawCategory]) {
      rawCategory = ALIAS_TO_REAL_KEY[rawCategory];
    }
    const category =
      rawCategory && validKeys.has(rawCategory) ? rawCategory : null;

    const confidenceNum =
      typeof parsed.confidence === "number" ? parsed.confidence : 0;
    const confidence = Math.min(1, Math.max(0, confidenceNum));

    return {
      isScam: parsed.is_scam === true,
      category,
      confidence,
      rationale:
        typeof parsed.rationale === "string" && parsed.rationale.trim()
          ? parsed.rationale.trim().slice(0, 280)
          : "AI classified this message.",
    };
  } catch (err) {
    // The upstream provider (Azure-backed) applies its own content-safety
    // filter that can reject a prompt with HTTP 400 / code "content_filter".
    // This fires both on genuinely explicit scam content AND as a false
    // positive on innocuous messages, so we cannot safely infer a verdict
    // from it. We degrade gracefully to the non-AI signals instead, and log
    // it as an expected limitation rather than an error.
    if (isContentFilterError(err)) {
      logger.warn(
        { requestId: extractRequestId(err) },
        "AI classification skipped: prompt rejected by provider content filter",
      );
      return null;
    }

    logger.error({ err }, "AI message classification failed");
    return null;
  }
}

/** True when the error is the provider's content-safety rejection. */
function isContentFilterError(err: unknown): boolean {
  const e = err as { code?: string; error?: { code?: string } };
  return e?.code === "content_filter" || e?.error?.code === "content_filter";
}

function extractRequestId(err: unknown): string | undefined {
  const e = err as { requestID?: string };
  return e?.requestID;
}
