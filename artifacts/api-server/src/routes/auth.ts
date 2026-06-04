import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, sessionsTable, usersTable } from "@workspace/db";
import {
  CheckPhoneBody,
  UpdateMyLocationBody,
  VerifyTokenBody,
  type AuthResponse,
  type CheckPhoneResult,
  type SuccessResponse,
} from "@workspace/api-zod";
import { config } from "../config";
import { normalizeIndianPhone } from "../lib/phone";
import { generateToken, hashToken } from "../lib/token";
import { verifyAccessToken } from "../lib/msg91-widget";
import { HttpError } from "../lib/http-error";
import { hitRateLimit } from "../lib/rate-limit";
import { toUserDto } from "../lib/dto";
import { requireAuth } from "../middlewares/auth";

const router: IRouter = Router();

// The MSG91 OTP widget (mobile RN SDK) handles sending and verifying the code
// on MSG91's side. This endpoint only tells the client whether the number is a
// new account, so it can collect registration details before launching the
// widget. It never sends an OTP itself.
router.post("/auth/check-phone", async (req, res) => {
  const clientKey = req.ip ?? "unknown";
  const ipLimit = hitRateLimit(
    `phone-check:${clientKey}`,
    config.otpRequestMaxPerIpPerHour,
    3_600_000,
  );
  if (!ipLimit.allowed) {
    throw new HttpError(
      429,
      "rate_limited",
      "Too many requests from this device. Please try again later.",
    );
  }

  const body = CheckPhoneBody.parse(req.body);
  const phone = normalizeIndianPhone(body.phone);
  if (!phone) {
    throw new HttpError(
      400,
      "invalid_phone",
      "Enter a valid 10-digit Indian mobile number",
    );
  }

  const [existing] = await db
    .select({ id: usersTable.id })
    .from(usersTable)
    .where(eq(usersTable.phone, phone))
    .limit(1);

  const result: CheckPhoneResult = { isNewUser: !existing };
  res.json(result);
});

// Verify the MSG91 widget access token server-side, then sign the user in. The
// verified phone number comes from MSG91 (never from the client), so a caller
// can't authenticate as a number they didn't actually verify.
router.post("/auth/verify-token", async (req, res) => {
  const clientKey = req.ip ?? "unknown";
  const ipLimit = hitRateLimit(
    `token-verify:${clientKey}`,
    config.otpVerifyMaxPerIpPerMinute,
    60_000,
  );
  if (!ipLimit.allowed) {
    throw new HttpError(
      429,
      "too_many_attempts",
      "Too many attempts from this device. Please try again later.",
    );
  }

  const body = VerifyTokenBody.parse(req.body);

  const { phone } = await verifyAccessToken(body.accessToken);

  let [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.phone, phone))
    .limit(1);

  const shouldBeAdmin = config.adminPhones.includes(phone);

  if (!user && !body.fullName?.trim()) {
    throw new HttpError(
      400,
      "registration_required",
      "Full name is required to create your account.",
    );
  }

  if (!user) {
    const fullName = body.fullName!.trim();
    [user] = await db
      .insert(usersTable)
      .values({
        fullName,
        phone,
        location: body.location?.trim() || null,
        isAdmin: shouldBeAdmin,
      })
      .returning();
  } else {
    const updates: Partial<typeof usersTable.$inferInsert> = {};
    if (body.fullName?.trim()) updates.fullName = body.fullName.trim();
    if (body.location?.trim()) updates.location = body.location.trim();
    if (shouldBeAdmin && !user.isAdmin) updates.isAdmin = true;
    if (Object.keys(updates).length > 0) {
      [user] = await db
        .update(usersTable)
        .set({ ...updates, updatedAt: new Date() })
        .where(eq(usersTable.id, user.id))
        .returning();
    }
  }

  const token = generateToken();
  const expiresAt = new Date(
    Date.now() + config.sessionTtlDays * 24 * 60 * 60 * 1000,
  );
  await db
    .insert(sessionsTable)
    .values({ userId: user.id, tokenHash: hashToken(token), expiresAt });

  const response: AuthResponse = { token, user: toUserDto(user) };
  res.json(response);
});

router.get("/auth/me", requireAuth, async (req, res) => {
  res.json(toUserDto(req.user!));
});

router.patch("/me/location", requireAuth, async (req, res) => {
  const user = req.user!;
  const body = UpdateMyLocationBody.parse(req.body);
  const location = body.location.trim();

  if (!location) {
    res.json(toUserDto(user));
    return;
  }

  // Only write when the detected city actually changed to avoid needless writes.
  if (user.location === location) {
    res.json(toUserDto(user));
    return;
  }

  const [updated] = await db
    .update(usersTable)
    .set({ location, updatedAt: new Date() })
    .where(eq(usersTable.id, user.id))
    .returning();

  res.json(toUserDto(updated));
});

router.post("/auth/logout", requireAuth, async (req, res) => {
  const header = req.headers.authorization;
  if (header?.startsWith("Bearer ")) {
    const token = header.slice(7).trim();
    if (token) {
      await db
        .delete(sessionsTable)
        .where(eq(sessionsTable.tokenHash, hashToken(token)));
    }
  }
  const response: SuccessResponse = { success: true };
  res.json(response);
});

export default router;
