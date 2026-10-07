import { Router, type IRouter } from "express";
import { SmsLinkCheckBody, type FraudVerdict } from "@workspace/api-zod";
import { requireAuth } from "../middlewares/auth";
import { HttpError } from "../lib/http-error";
import { hitRateLimit } from "../lib/rate-limit";
import { runFraudCheck } from "../lib/fraud-engine";

const router: IRouter = Router();

/**
 * Link check for the phone's automatic SMS protection. The phone sends only a
 * link from a suspicious-looking message (never the text). Quick mode skips the
 * paid AI and Safe Browsing lookups, so it doesn't use the free daily checks;
 * a per-user hourly limit stops abuse.
 */
router.post("/sms/link-check", requireAuth, async (req, res) => {
  const user = req.user!;
  const { url } = SmsLinkCheckBody.parse(req.body);
  const value = url.trim();
  if (!value) throw new HttpError(400, "invalid_value", "Provide a link to check.");

  const { allowed } = await hitRateLimit(`sms-link:${user.id}`, 60, 60 * 60 * 1000);
  if (!allowed) {
    throw new HttpError(429, "rate_limited", "Too many link checks. Try again later.");
  }

  const verdict: FraudVerdict = await runFraudCheck("url", value, { quick: true });
  res.json(verdict);
});

export default router;
