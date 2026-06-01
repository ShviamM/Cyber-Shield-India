import { Router, type IRouter } from "express";
import { FraudCheckBody, type FraudVerdict } from "@workspace/api-zod";
import { config } from "../config";
import { HttpError } from "../lib/http-error";
import { hitRateLimit } from "../lib/rate-limit";
import { runFraudCheck, type FraudCheckType } from "../lib/fraud-engine";

const router: IRouter = Router();

const MAX_VALUE_LENGTH = 5000;

router.post("/check", async (req, res) => {
  const clientKey = req.ip ?? "unknown";
  const { allowed } = hitRateLimit(
    `fraud-check:${clientKey}`,
    config.fraudCheckMaxPerMinute,
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

  const verdict: FraudVerdict = await runFraudCheck(
    body.type as FraudCheckType,
    value,
  );
  res.json(verdict);
});

export default router;
