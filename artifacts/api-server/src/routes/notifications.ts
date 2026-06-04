import { Router, type IRouter } from "express";
import { and, eq, ne } from "drizzle-orm";
import { db, deviceTokensTable } from "@workspace/db";
import { RegisterPushTokenBody, type SuccessResponse } from "@workspace/api-zod";
import { requireAuth } from "../middlewares/auth";

const router: IRouter = Router();

/**
 * Register (or re-bind) this device's Expo push token to the current user. The
 * token is globally unique: if it already exists it is reassigned to this user
 * (e.g. a shared device), otherwise it is inserted.
 */
router.post("/me/push-token", requireAuth, async (req, res) => {
  const user = req.user!;
  const body = RegisterPushTokenBody.parse(req.body);
  const token = body.token.trim();
  const platform = body.platform ?? null;

  const [existing] = await db
    .select()
    .from(deviceTokensTable)
    .where(eq(deviceTokensTable.token, token))
    .limit(1);

  if (existing) {
    await db
      .update(deviceTokensTable)
      .set({ userId: user.id, platform, updatedAt: new Date() })
      .where(eq(deviceTokensTable.id, existing.id));
  } else {
    await db
      .insert(deviceTokensTable)
      .values({ userId: user.id, token, platform });
  }

  // Drop any duplicate rows that still point this token at another user.
  await db
    .delete(deviceTokensTable)
    .where(
      and(
        eq(deviceTokensTable.token, token),
        ne(deviceTokensTable.userId, user.id),
      ),
    );

  const response: SuccessResponse = { success: true };
  res.json(response);
});

export default router;
