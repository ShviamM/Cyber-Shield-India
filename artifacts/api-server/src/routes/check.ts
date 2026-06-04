import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, sessionsTable, usersTable } from "@workspace/db";
import { FraudCheckBody, type FraudVerdict } from "@workspace/api-zod";
import { config } from "../config";
import { HttpError } from "../lib/http-error";
import { hitRateLimit } from "../lib/rate-limit";
import { hashToken } from "../lib/token";
import { getEffectiveSubscription } from "../lib/subscription";
import { runFraudCheck, type FraudCheckType } from "../lib/fraud-engine";

const router: IRouter = Router();

const MAX_VALUE_LENGTH = 5000;

/**
 * Resolve the caller's premium status from an optional Bearer token. The check
 * endpoint stays open to everyone (it's the advertised free feature); paid users
 * simply get a higher "priority" rate-limit budget. Any auth failure silently
 * falls back to anonymous — it never blocks the request.
 */
async function resolvePremiumUser(
  req: import("express").Request,
): Promise<{ userId: string; isPremium: boolean } | null> {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) return null;
  const token = header.slice(7).trim();
  if (!token) return null;
  try {
    const [row] = await db
      .select({ user: usersTable, expiresAt: sessionsTable.expiresAt })
      .from(sessionsTable)
      .innerJoin(usersTable, eq(sessionsTable.userId, usersTable.id))
      .where(eq(sessionsTable.tokenHash, hashToken(token)))
      .limit(1);
    if (!row || row.expiresAt.getTime() < Date.now()) return null;
    if (row.user.status === "blocked") return null;
    const sub = await getEffectiveSubscription(row.user.id);
    return { userId: row.user.id, isPremium: sub.isPremium };
  } catch {
    return null;
  }
}

router.post("/check", async (req, res) => {
  const caller = await resolvePremiumUser(req);
  const clientKey = caller
    ? `user:${caller.userId}`
    : `ip:${req.ip ?? "unknown"}`;
  const limit = caller?.isPremium
    ? config.fraudCheckPremiumMaxPerMinute
    : config.fraudCheckMaxPerMinute;
  const { allowed } = hitRateLimit(`fraud-check:${clientKey}`, limit, 60_000);
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
