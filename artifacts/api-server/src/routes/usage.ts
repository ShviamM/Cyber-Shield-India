import { Router, type IRouter } from "express";
import type { UsageStatus } from "@workspace/api-zod";
import { requireAuth } from "../middlewares/auth";
import { getEffectiveSubscription } from "../lib/subscription";
import { FREE_DAILY_LIMITS, getDailyUsage } from "../lib/usage";

const router: IRouter = Router();

/**
 * The signed-in user's daily check usage and premium status, so the client can
 * show "X free checks left today" and decide when to surface the paywall.
 * Premium users are unmetered; their meters report remaining as the full limit.
 */
router.get("/me/usage", requireAuth, async (req, res) => {
  const user = req.user!;
  const sub = await getEffectiveSubscription(user.id);
  const used = await getDailyUsage(`user:${user.id}`);

  const meter = (kind: "number_check" | "ai_check") => {
    const limit = FREE_DAILY_LIMITS[kind];
    const u = sub.isPremium ? 0 : used[kind];
    return { used: u, limit, remaining: Math.max(0, limit - u) };
  };

  const response: UsageStatus = {
    isPremium: sub.isPremium,
    numberChecks: meter("number_check"),
    aiChecks: meter("ai_check"),
  };
  res.json(response);
});

export default router;
