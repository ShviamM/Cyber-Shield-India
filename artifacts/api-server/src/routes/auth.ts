import { Router, type IRouter } from "express";
import { and, desc, eq, gt, isNull, sql } from "drizzle-orm";
import {
  db,
  otpCodesTable,
  sessionsTable,
  usersTable,
} from "@workspace/db";
import {
  RequestOtpBody,
  UpdateMyLocationBody,
  VerifyOtpBody,
  type AuthResponse,
  type RequestOtpResult,
  type SuccessResponse,
} from "@workspace/api-zod";
import { config } from "../config";
import { normalizeIndianPhone } from "../lib/phone";
import { generateOtp, hashOtp } from "../lib/otp";
import { generateToken, hashToken } from "../lib/token";
import { smsSender } from "../lib/sms";
import { HttpError } from "../lib/http-error";
import { hitRateLimit } from "../lib/rate-limit";
import { toUserDto } from "../lib/dto";
import { requireAuth } from "../middlewares/auth";

const router: IRouter = Router();

router.post("/auth/request-otp", async (req, res) => {
  const clientKey = req.ip ?? "unknown";
  const ipLimit = hitRateLimit(
    `otp-request:${clientKey}`,
    config.otpRequestMaxPerIpPerHour,
    3_600_000,
  );
  if (!ipLimit.allowed) {
    throw new HttpError(
      429,
      "rate_limited",
      "Too many OTP requests from this device. Please try again later.",
    );
  }

  const body = RequestOtpBody.parse(req.body);
  const phone = normalizeIndianPhone(body.phone);
  if (!phone) {
    throw new HttpError(
      400,
      "invalid_phone",
      "Enter a valid 10-digit Indian mobile number",
    );
  }

  const now = Date.now();
  const hourAgo = new Date(now - 3_600_000);
  const recent = await db
    .select({ createdAt: otpCodesTable.createdAt })
    .from(otpCodesTable)
    .where(and(eq(otpCodesTable.phone, phone), gt(otpCodesTable.createdAt, hourAgo)))
    .orderBy(desc(otpCodesTable.createdAt));

  if (recent.length >= config.otpMaxPerHour) {
    throw new HttpError(
      429,
      "rate_limited",
      "Too many OTP requests. Please try again later.",
    );
  }
  const last = recent[0];
  if (
    last &&
    now - last.createdAt.getTime() < config.otpResendIntervalSeconds * 1000
  ) {
    throw new HttpError(
      429,
      "too_soon",
      "Please wait a moment before requesting another OTP.",
    );
  }

  const code = generateOtp();
  const expiresAt = new Date(now + config.otpTtlSeconds * 1000);
  const [otpRow] = await db
    .insert(otpCodesTable)
    .values({ phone, codeHash: hashOtp(phone, code), expiresAt })
    .returning({ id: otpCodesTable.id });

  try {
    await smsSender.sendOtp(phone, code);
  } catch {
    // Delivery failed (e.g. Twilio trial-account/unverified recipient, DLT
    // registration, provider outage). Remove the OTP row so this failed attempt
    // doesn't count toward the resend cooldown or hourly cap — otherwise the
    // user gets rate-limited without ever receiving a code.
    await db.delete(otpCodesTable).where(eq(otpCodesTable.id, otpRow.id));
    throw new HttpError(
      502,
      "sms_delivery_failed",
      "Couldn't send the verification code right now. Please try again shortly.",
    );
  }

  const [existing] = await db
    .select({ id: usersTable.id })
    .from(usersTable)
    .where(eq(usersTable.phone, phone))
    .limit(1);

  const result: RequestOtpResult = {
    success: true,
    isNewUser: !existing,
    expiresInSeconds: config.otpTtlSeconds,
    ...(config.isProduction ? {} : { devOtp: code }),
  };
  res.json(result);
});

router.post("/auth/verify-otp", async (req, res) => {
  const clientKey = req.ip ?? "unknown";
  const ipLimit = hitRateLimit(
    `otp-verify:${clientKey}`,
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

  const body = VerifyOtpBody.parse(req.body);
  const phone = normalizeIndianPhone(body.phone);
  if (!phone) {
    throw new HttpError(
      400,
      "invalid_phone",
      "Enter a valid 10-digit Indian mobile number",
    );
  }
  const code = body.code.trim();

  const [otp] = await db
    .select()
    .from(otpCodesTable)
    .where(and(eq(otpCodesTable.phone, phone), isNull(otpCodesTable.consumedAt)))
    .orderBy(desc(otpCodesTable.createdAt))
    .limit(1);

  if (!otp) {
    throw new HttpError(400, "otp_not_found", "Please request a new OTP.");
  }
  if (otp.expiresAt.getTime() < Date.now()) {
    throw new HttpError(400, "otp_expired", "OTP expired. Request a new one.");
  }
  if (otp.attempts >= config.otpMaxAttempts) {
    throw new HttpError(
      429,
      "too_many_attempts",
      "Too many incorrect attempts. Request a new OTP.",
    );
  }
  if (otp.codeHash !== hashOtp(phone, code)) {
    await db
      .update(otpCodesTable)
      .set({ attempts: sql`${otpCodesTable.attempts} + 1` })
      .where(eq(otpCodesTable.id, otp.id));
    throw new HttpError(400, "invalid_otp", "Incorrect OTP. Please try again.");
  }

  let [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.phone, phone))
    .limit(1);

  const shouldBeAdmin = config.adminPhones.includes(phone);

  // Require the name for new accounts BEFORE consuming the OTP, so a correct
  // code submitted without a name doesn't waste the user's one-time code.
  if (!user && !body.fullName?.trim()) {
    throw new HttpError(
      400,
      "registration_required",
      "Full name is required to create your account.",
    );
  }

  // Consume the OTP atomically: the conditional WHERE ensures only one of any
  // concurrent verify requests can win, so a single code can't mint two
  // sessions. If no row is affected, another request already consumed it.
  const consumed = await db
    .update(otpCodesTable)
    .set({ consumedAt: new Date() })
    .where(and(eq(otpCodesTable.id, otp.id), isNull(otpCodesTable.consumedAt)))
    .returning({ id: otpCodesTable.id });
  if (consumed.length === 0) {
    throw new HttpError(400, "otp_not_found", "Please request a new OTP.");
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
