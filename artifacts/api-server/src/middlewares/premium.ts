import type { NextFunction, Request, Response } from "express";
import { HttpError } from "../lib/http-error";
import { getEffectiveSubscription } from "../lib/subscription";

/**
 * Gate a route behind an active paid plan. Must run AFTER `requireAuth` so that
 * `req.user` is populated. The premium status is always recomputed server-side
 * from the subscription record — the client never asserts its own access.
 */
export async function requirePremium(
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> {
  const user = req.user;
  if (!user) {
    return next(new HttpError(401, "unauthorized", "Authentication required"));
  }
  try {
    const sub = await getEffectiveSubscription(user.id);
    if (!sub.isPremium) {
      return next(
        new HttpError(
          402,
          "premium_required",
          "This feature requires an active Premium or Family plan.",
        ),
      );
    }
    next();
  } catch (err) {
    next(err);
  }
}
