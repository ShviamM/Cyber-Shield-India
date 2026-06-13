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
 * they are absent we skip the OpenAI call and fall through to the Gemini
 * fallback (or, if neither is configured, the non-AI signals).
 */
function isOpenAiConfigured(): boolean {
  return Boolean(
    (process.env.AI_INTEGRATIONS_OPENAI_BASE_URL &&
      process.env.AI_INTEGRATIONS_OPENAI_API_KEY) ||
      process.env.OPENAI_API_KEY,
  );
}

/** The Replit-managed Gemini integration, used as a content-filter-resilient fallback. */
function isGeminiConfigured(): boolean {
  return Boolean(
    process.env.AI_INTEGRATIONS_GEMINI_BASE_URL &&
      process.env.AI_INTEGRATIONS_GEMINI_API_KEY,
  );
}

/** True when ANY AI provider is available. Callers degrade gracefully if false. */
export function isAiConfigured(): boolean {
  return isOpenAiConfigured() || isGeminiConfigured();
}

const SYSTEM_PROMPT = `You are a fraud-detection classifier for Netraksh, an Indian cyber-safety app.
You receive a single SMS, chat, or call-transcript message and decide whether it is a scam targeting Indian consumers.
Common scams: OTP theft, fake KYC/Aadhaar/PAN updates, lottery/prize wins, loan/credit-card offers, job/work-from-home tasks, UPI/payment tricks, digital-arrest/police impersonation, electricity-bill disconnection, courier/parcel customs holds, tech support, bank/government impersonation, investment/trading guarantees, and blackmail or extortion threats.
A message is a scam only when it pressures the user to act in a risky way: share an OTP/PIN/CVV/password, click a link, call a number to "reverse"/"refund"/"reactivate"/"verify", install an app, or make a payment to claim or release money.
Do NOT flag legitimate informational messages. In particular, a normal bank or wallet transaction alert that simply reports a debit/credit and includes a standard "Not you? Call <official number>" or "report" line is NOT a scam. Genuine delivery updates, payment confirmations, OTP-delivery messages ("123456 is your OTP, do not share"), and subsidy/credit notifications are NOT scams.
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

/** Build the category list block, substituting filter-tripping keys with neutral aliases. */
function buildCategoryList(categories: { key: string; nameEn: string }[]): string {
  return categories
    .map((c) => {
      const alias = CATEGORY_PROMPT_ALIAS[c.key];
      return alias ? `- ${alias.key}: ${alias.name}` : `- ${c.key}: ${c.nameEn}`;
    })
    .join("\n");
}

function buildUserPrompt(categoryList: string, trimmed: string): string {
  return `Category keys:\n${categoryList}\n\nMessage:\n"""\n${trimmed.slice(0, 4000)}\n"""`;
}

/** Parse a model's JSON output into a normalized classification, or null if unusable. */
function parseClassification(
  content: string | undefined,
  validKeys: Set<string>,
): MessageClassification | null {
  if (!content) return null;
  let parsed: RawClassification;
  try {
    parsed = JSON.parse(content) as RawClassification;
  } catch {
    return null;
  }

  let rawCategory = typeof parsed.category === "string" ? parsed.category : null;
  // Map any neutral alias the model returned back to the real stored key.
  if (rawCategory && ALIAS_TO_REAL_KEY[rawCategory]) {
    rawCategory = ALIAS_TO_REAL_KEY[rawCategory];
  }
  const category = rawCategory && validKeys.has(rawCategory) ? rawCategory : null;

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
}

/**
 * Classify a raw message. Tries OpenAI first; if OpenAI is unavailable or its
 * Azure-backed content filter rejects the prompt (which happens as a false
 * positive on innocuous scam text), falls back to Gemini, whose safety
 * thresholds we relax so it will actually analyze the message. Returns null
 * only when every provider is unavailable, so callers degrade gracefully.
 */
export async function classifyMessage(
  text: string,
  categories: { key: string; nameEn: string }[],
): Promise<MessageClassification | null> {
  if (!isAiConfigured()) return null;

  const trimmed = text.trim();
  if (!trimmed) return null;

  const validKeys = new Set(categories.map((c) => c.key));
  const categoryList = buildCategoryList(categories);
  const userPrompt = buildUserPrompt(categoryList, trimmed);

  // --- Primary: OpenAI (gpt-5-mini) ---
  if (isOpenAiConfigured()) {
    try {
      const { openai } = await import("@workspace/integrations-openai-ai-server");
      const completion = await openai.chat.completions.create({
        model: "gpt-5-mini",
        max_completion_tokens: 8192,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userPrompt },
        ],
      });
      void recordAiUsage("gpt-5-mini", "classify_message", completion.usage);
      const result = parseClassification(
        completion.choices[0]?.message?.content?.trim(),
        validKeys,
      );
      if (result) return result;
    } catch (err) {
      // The Azure-backed OpenAI provider applies a content-safety filter that
      // can reject a prompt with HTTP 400 / code "content_filter". It fires
      // both on genuinely explicit content AND as a false positive on
      // innocuous scam text (e.g. job/work-from-home offers), silently
      // disabling AI for whole scam categories. Rather than infer a verdict
      // from it, we fall back to Gemini below.
      if (isContentFilterError(err)) {
        logger.warn(
          { requestId: extractRequestId(err) },
          "OpenAI classification rejected by content filter; trying Gemini fallback",
        );
      } else {
        logger.error({ err }, "OpenAI message classification failed; trying Gemini fallback");
      }
    }
  }

  // --- Fallback: Gemini (gemini-2.5-flash) ---
  if (isGeminiConfigured()) {
    try {
      return await classifyWithGemini(userPrompt, validKeys);
    } catch (err) {
      logger.error({ err }, "Gemini message classification failed");
    }
  }

  return null;
}

/**
 * Gemini fallback. Safety thresholds are set to BLOCK_NONE because this is a
 * fraud-detection classifier that must be able to read scam text; without this
 * Gemini would refuse the same content Azure's filter blocks, defeating the
 * purpose of the fallback.
 */
async function classifyWithGemini(
  userPrompt: string,
  validKeys: Set<string>,
): Promise<MessageClassification | null> {
  const { ai, HarmCategory, HarmBlockThreshold } = await import(
    "@workspace/integrations-gemini-ai"
  );

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: [{ role: "user", parts: [{ text: userPrompt }] }],
    config: {
      systemInstruction: SYSTEM_PROMPT,
      responseMimeType: "application/json",
      maxOutputTokens: 8192,
      temperature: 0,
      safetySettings: [
        { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
      ],
    },
  });

  const usage = response.usageMetadata;
  void recordAiUsage("gemini-2.5-flash", "classify_message", {
    prompt_tokens: usage?.promptTokenCount,
    completion_tokens: usage?.candidatesTokenCount,
    total_tokens: usage?.totalTokenCount,
  });

  return parseClassification(response.text?.trim(), validKeys);
}

// ---- URL reputation ------------------------------------------------------

export type UrlClassification = {
  /**
   * "malicious"  — phishing/scam/malware site;
   * "suspicious" — risky structure or weak signals, treat with caution;
   * "likely_safe" — a domain the model recognizes as established/legitimate;
   * "unknown"    — no basis to judge.
   */
  verdict: "malicious" | "suspicious" | "likely_safe" | "unknown";
  /** Model confidence, 0-1. */
  confidence: number;
  /** Short English explanation (no PII echoed back). */
  rationale: string;
};

const URL_SYSTEM_PROMPT = `You are a URL reputation analyst for Netraksh, an Indian cyber-safety app.
Given a single URL, judge whether it is likely a phishing, scam, or malware site targeting Indian consumers, or a well-known legitimate site.
You CANNOT fetch the page — judge only from the URL itself and your own knowledge of the registrable domain's reputation.
Consider: is the registrable domain a recognized, established, legitimate organization? Does it impersonate an Indian bank, wallet/UPI app (Paytm, PhonePe, GPay), government service (Aadhaar/UIDAI, income tax, India Post, NPCI), courier, or telecom via a look-alike/typosquat domain? Does the structure match common Indian phishing (fake KYC/refund/reward/login pages, raw IP hosts, abused cheap TLDs, deep subdomains, credentials embedded before the host)?
Respond ONLY with a JSON object: {"verdict": "malicious"|"suspicious"|"likely_safe"|"unknown", "confidence": number, "rationale": string}.
- "verdict": use "likely_safe" ONLY for registrable domains you actually recognize as established and legitimate; use "unknown" when you have no basis to judge an unfamiliar domain.
- "confidence": a number from 0 to 1.
- "rationale": one short English sentence, no PII.`;

type RawUrlClassification = {
  verdict?: unknown;
  confidence?: unknown;
  rationale?: unknown;
};

const URL_VERDICTS = new Set([
  "malicious",
  "suspicious",
  "likely_safe",
  "unknown",
]);

/** Parse a model's JSON output into a normalized URL classification, or null if unusable. */
function parseUrlClassification(
  content: string | undefined,
): UrlClassification | null {
  if (!content) return null;
  let parsed: RawUrlClassification;
  try {
    parsed = JSON.parse(content) as RawUrlClassification;
  } catch {
    return null;
  }

  const rawVerdict =
    typeof parsed.verdict === "string" ? parsed.verdict.toLowerCase() : "";
  const verdict = (
    URL_VERDICTS.has(rawVerdict) ? rawVerdict : "unknown"
  ) as UrlClassification["verdict"];

  const confidenceNum =
    typeof parsed.confidence === "number" ? parsed.confidence : 0;
  const confidence = Math.min(1, Math.max(0, confidenceNum));

  return {
    verdict,
    confidence,
    rationale:
      typeof parsed.rationale === "string" && parsed.rationale.trim()
        ? parsed.rationale.trim().slice(0, 280)
        : "AI assessed this link's reputation.",
  };
}

/**
 * Assess a URL's reputation with AI. Tries OpenAI first; on the Azure content
 * filter or any failure, falls back to Gemini (BLOCK_NONE), mirroring
 * classifyMessage. Returns null only when every provider is unavailable, so the
 * URL analyzer degrades to structural heuristics + threat feed alone.
 */
export async function classifyUrl(
  url: string,
): Promise<UrlClassification | null> {
  if (!isAiConfigured()) return null;

  const trimmed = url.trim();
  if (!trimmed) return null;

  const userPrompt = `URL:\n"""\n${trimmed.slice(0, 2000)}\n"""`;

  // --- Primary: OpenAI (gpt-5-mini) ---
  if (isOpenAiConfigured()) {
    try {
      const { openai } = await import("@workspace/integrations-openai-ai-server");
      const completion = await openai.chat.completions.create({
        model: "gpt-5-mini",
        max_completion_tokens: 8192,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: URL_SYSTEM_PROMPT },
          { role: "user", content: userPrompt },
        ],
      });
      void recordAiUsage("gpt-5-mini", "classify_url", completion.usage);
      const result = parseUrlClassification(
        completion.choices[0]?.message?.content?.trim(),
      );
      if (result) return result;
    } catch (err) {
      if (isContentFilterError(err)) {
        logger.warn(
          { requestId: extractRequestId(err) },
          "OpenAI URL classification rejected by content filter; trying Gemini fallback",
        );
      } else {
        logger.error({ err }, "OpenAI URL classification failed; trying Gemini fallback");
      }
    }
  }

  // --- Fallback: Gemini (gemini-2.5-flash) ---
  if (isGeminiConfigured()) {
    try {
      return await classifyUrlWithGemini(userPrompt);
    } catch (err) {
      logger.error({ err }, "Gemini URL classification failed");
    }
  }

  return null;
}

/** Gemini fallback for URL reputation. Safety thresholds relaxed (see classifyWithGemini). */
async function classifyUrlWithGemini(
  userPrompt: string,
): Promise<UrlClassification | null> {
  const { ai, HarmCategory, HarmBlockThreshold } = await import(
    "@workspace/integrations-gemini-ai"
  );

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: [{ role: "user", parts: [{ text: userPrompt }] }],
    config: {
      systemInstruction: URL_SYSTEM_PROMPT,
      responseMimeType: "application/json",
      maxOutputTokens: 8192,
      temperature: 0,
      safetySettings: [
        { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
      ],
    },
  });

  const usage = response.usageMetadata;
  void recordAiUsage("gemini-2.5-flash", "classify_url", {
    prompt_tokens: usage?.promptTokenCount,
    completion_tokens: usage?.candidatesTokenCount,
    total_tokens: usage?.totalTokenCount,
  });

  return parseUrlClassification(response.text?.trim());
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
