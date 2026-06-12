import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, sessionsTable, usersTable } from "@workspace/db";
import {
  AdminLoginBody,
  CheckPhoneBody,
  DemoLoginBody,
  DevLoginBody,
  UpdateMyLocationBody,
  VerifyTokenBody,
  type AuthResponse,
  type CheckPhoneResult,
  type SuccessResponse,
} from "@workspace/api-zod";
import { config, isDevLoginEnabled } from "../config";
import { normalizeIndianPhone } from "../lib/phone";
import { generateToken, hashToken, safeCompare } from "../lib/token";
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
  const ipLimit = await hitRateLimit(
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
  const ipLimit = await hitRateLimit(
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

// Password-only sign-in for the admin web console. A single shared password
// (ADMIN_PASSWORD) is compared in constant time; on success we issue a session
// for the configured admin account (first entry in ADMIN_PHONES).
router.post("/auth/admin-login", async (req, res) => {
  const clientKey = req.ip ?? "unknown";
  // Two-tier per-IP throttle to slow brute-force guessing of the shared password.
  const [perMinute, perHour] = await Promise.all([
    hitRateLimit(
      `admin-login:m:${clientKey}`,
      config.adminLoginMaxPerIpPerMinute,
      60_000,
    ),
    hitRateLimit(
      `admin-login:h:${clientKey}`,
      config.adminLoginMaxPerIpPerHour,
      3_600_000,
    ),
  ]);
  if (!perMinute.allowed || !perHour.allowed) {
    throw new HttpError(
      429,
      "too_many_attempts",
      "Too many attempts from this device. Please try again later.",
    );
  }

  const body = AdminLoginBody.parse(req.body);

  const adminPhone = config.adminPhones[0];
  if (!config.adminPassword || !adminPhone) {
    throw new HttpError(
      503,
      "admin_login_unavailable",
      "Admin login is not configured. Please contact the administrator.",
    );
  }

  if (!safeCompare(body.password, config.adminPassword)) {
    throw new HttpError(401, "invalid_credentials", "Incorrect password.");
  }

  // Find or create the canonical admin account, ensuring it is flagged admin.
  let [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.phone, adminPhone))
    .limit(1);

  if (!user) {
    [user] = await db
      .insert(usersTable)
      .values({ fullName: "Administrator", phone: adminPhone, isAdmin: true })
      .returning();
  } else if (!user.isAdmin) {
    [user] = await db
      .update(usersTable)
      .set({ isAdmin: true, updatedAt: new Date() })
      .where(eq(usersTable.id, user.id))
      .returning();
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

// Development-only test login. The mobile OTP relies on MSG91's native widget,
// which cannot run inside Expo Go or the web preview, so this lets us sign in
// without OTP while testing those environments. It is fail-closed: enabled only
// when isDevLoginEnabled() (non-production NODE_ENV *and* an explicit
// ENABLE_DEV_LOGIN opt-in). Otherwise it 404s so the endpoint is invisible. The
// gate is server-side only — nothing the client sends can turn it on.
router.post("/auth/dev-login", async (req, res) => {
  if (!isDevLoginEnabled()) {
    throw new HttpError(404, "not_found", "Not found.");
  }

  const clientKey = req.ip ?? "unknown";
  const ipLimit = await hitRateLimit(
    `dev-login:${clientKey}`,
    config.devLoginMaxPerIpPerMinute,
    60_000,
  );
  if (!ipLimit.allowed) {
    throw new HttpError(
      429,
      "too_many_attempts",
      "Too many attempts from this device. Please try again later.",
    );
  }

  const body = DevLoginBody.parse(req.body);
  const phone = normalizeIndianPhone(body.phone);
  if (!phone) {
    throw new HttpError(
      400,
      "invalid_phone",
      "Enter a valid 10-digit Indian mobile number",
    );
  }

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
    [user] = await db
      .insert(usersTable)
      .values({
        fullName: body.fullName!.trim(),
        phone,
        location: body.location?.trim() || null,
        isAdmin: shouldBeAdmin,
      })
      .returning();
  } else {
    // Mirror verify-token: keep name/location fresh and never silently strip
    // an existing admin's privileges.
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

// Demo login for app store (Google Play) review. Reviewers cannot receive an
// OTP on the demo number, so this signs in a single fixed, NON-admin demo
// account when given the configured demo phone *and* demo passcode. Unlike
// dev-login it intentionally works in production, but it is tightly scoped:
// only the one configured number is accepted, the passcode is compared in
// constant time, and the account is never granted admin rights. Disabled (404)
// when no demo credentials are configured (e.g. DEMO_LOGIN_OTP="").
router.post("/auth/demo-login", async (req, res) => {
  const demoPhone = config.demoLoginPhone;
  const demoOtp = config.demoLoginOtp;
  if (!demoPhone || !demoOtp) {
    throw new HttpError(404, "not_found", "Not found.");
  }

  const clientKey = req.ip ?? "unknown";
  const ipLimit = await hitRateLimit(
    `demo-login:${clientKey}`,
    config.demoLoginMaxPerIpPerMinute,
    60_000,
  );
  if (!ipLimit.allowed) {
    throw new HttpError(
      429,
      "too_many_attempts",
      "Too many attempts from this device. Please try again later.",
    );
  }

  const body = DemoLoginBody.parse(req.body);
  const phone = normalizeIndianPhone(body.phone);
  // One generic error for a wrong number or wrong passcode so the endpoint never
  // reveals which half was correct. Only the configured demo account can ever
  // authenticate here.
  const credentialsOk =
    Boolean(phone) && phone === demoPhone && safeCompare(body.otp, demoOtp);
  if (!credentialsOk) {
    throw new HttpError(
      401,
      "invalid_credentials",
      "Incorrect demo credentials.",
    );
  }

  let [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.phone, demoPhone))
    .limit(1);

  if (!user) {
    [user] = await db
      .insert(usersTable)
      .values({
        fullName: "Play Reviewer",
        phone: demoPhone,
        // Never grant admin: these credentials live in the store review notes.
        isAdmin: false,
      })
      .returning();
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

// Self-service account deletion (required by Google Play for apps with
// accounts). Deleting the user row cascades to sessions, family members,
// subscriptions, payments, fraud reports and device tokens — every FK that
// references the user uses onDelete: "cascade" — so this erases all of the
// account's data in a single statement.
router.delete("/me", requireAuth, async (req, res) => {
  const user = req.user!;
  await db.delete(usersTable).where(eq(usersTable.id, user.id));
  const response: SuccessResponse = { success: true };
  res.json(response);
});

export default router;
