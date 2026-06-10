import { Router, type IRouter } from "express";
import { FraudCheckBody, type FraudVerdict } from "@workspace/api-zod";
import { config } from "../config";
import { HttpError } from "../lib/http-error";
import { hitRateLimit } from "../lib/rate-limit";
import { resolveOptionalCaller, usageSubject } from "../lib/caller";
import { enforceDailyQuota } from "../lib/usage";
import { runFraudCheck, type FraudCheckType } from "../lib/fraud-engine";

const router: IRouter = Router();

const MAX_VALUE_LENGTH = 5000;

router.post("/check", async (req, res) => {
  const caller = await resolveOptionalCaller(req);
  const clientKey = caller
    ? `user:${caller.userId}`
    : `ip:${req.ip ?? "unknown"}`;

  // Per-minute abuse/cost guard (premium gets a higher burst budget).
  const limit = caller?.isPremium
    ? config.fraudCheckPremiumMaxPerMinute
    : config.fraudCheckMaxPerMinute;
  const { allowed } = await hitRateLimit(
    `fraud-check:${clientKey}`,
    limit,
    60_000,
  );
  if (!allowed) {
    throw new HttpError(
      429,
      "rate_limited",
      "Too many checks in a short time. Please try again in a minute.",
    );
  }

  const body = FraudCheckBody.parse(req.body);

  const value = body.value.trim();
  if (!value) {
    throw new HttpError(400, "invalid_value", "Provide a value to check.");
  }
  if (value.length > MAX_VALUE_LENGTH) {
    throw new HttpError(
      400,
      "value_too_long",
      `Value is too long (max ${MAX_VALUE_LENGTH} characters).`,
    );
  }

  // Freemium gate: free users get a daily allowance of AI fraud checks; premium
  // users are unlimited. A 402 ("free_limit_reached") drives the in-app paywall.
  if (!caller?.isPremium) {
    await enforceDailyQuota(usageSubject(req, caller), "ai_check");
  }

  const verdict: FraudVerdict = await runFraudCheck(
    body.type as FraudCheckType,
    value,
  );
  res.json(verdict);
});

export default router;
