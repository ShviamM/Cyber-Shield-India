import { afterAll, afterEach, describe, expect, it, vi } from "vitest";
import request from "supertest";
import { eq } from "drizzle-orm";

/**
 * Control the MSG91 widget verification per-test. The mock replaces the real
 * verifyAccessToken so we can simulate a verified/failed token without calling
 * MSG91. Must be declared before importing `app` so routes pick up the mock.
 */
const verifyAccessToken = vi.fn<(token: string) => Promise<{ phone: string }>>();
vi.mock("../lib/msg91-widget", () => ({
  verifyAccessToken: (token: string) => verifyAccessToken(token),
}));

const { default: app } = await import("../app");
const { db, usersTable, sessionsTable } = await import("@workspace/db");
const { HttpError } = await import("../lib/http-error");

function randomPhone(): string {
  const first = 6 + Math.floor(Math.random() * 4);
  const rest = Math.floor(Math.random() * 1_000_000_000)
    .toString()
    .padStart(9, "0");
  return `+91${first}${rest}`;
}

const usedPhones: string[] = [];

afterAll(async () => {
  for (const phone of usedPhones) {
    const users = await db
      .select({ id: usersTable.id })
      .from(usersTable)
      .where(eq(usersTable.phone, phone));
    for (const u of users) {
      await db.delete(sessionsTable).where(eq(sessionsTable.userId, u.id));
    }
    await db.delete(usersTable).where(eq(usersTable.phone, phone));
  }
});

describe("POST /auth/check-phone", () => {
  it("reports an unknown number as a new user", async () => {
    const phone = randomPhone();
    usedPhones.push(phone);

    const res = await request(app).post("/api/auth/check-phone").send({ phone });

    expect(res.status).toBe(200);
    expect(res.body.isNewUser).toBe(true);
  });

  it("rejects an invalid phone number", async () => {
    const res = await request(app)
      .post("/api/auth/check-phone")
      .send({ phone: "12345" });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe("invalid_phone");
  });
});

describe("POST /auth/verify-token", () => {
  it("requires a full name when registering a new number", async () => {
    const phone = randomPhone();
    usedPhones.push(phone);
    verifyAccessToken.mockResolvedValueOnce({ phone });

    const res = await request(app)
      .post("/api/auth/verify-token")
      .send({ accessToken: "valid-token" });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe("registration_required");
  });

  it("creates an account and issues a session for a verified token", async () => {
    const phone = randomPhone();
    usedPhones.push(phone);
    verifyAccessToken.mockResolvedValueOnce({ phone });

    const res = await request(app)
      .post("/api/auth/verify-token")
      .send({ accessToken: "valid-token", fullName: "Test User" });

    expect(res.status).toBe(200);
    expect(typeof res.body.token).toBe("string");
    expect(res.body.token.length).toBeGreaterThan(0);
    expect(res.body.user.phone).toBe(phone);

    // The number now belongs to an account, so check-phone flips to existing.
    const check = await request(app)
      .post("/api/auth/check-phone")
      .send({ phone });
    expect(check.body.isNewUser).toBe(false);
  });

  it("rejects an invalid or expired token", async () => {
    verifyAccessToken.mockRejectedValueOnce(
      new HttpError(401, "verification_failed", "bad token"),
    );

    const res = await request(app)
      .post("/api/auth/verify-token")
      .send({ accessToken: "bad-token", fullName: "Test User" });

    expect(res.status).toBe(401);
    expect(res.body.error).toBe("verification_failed");
  });
});

describe("POST /auth/dev-login", () => {
  const ENABLE = process.env.ENABLE_DEV_LOGIN;
  const NODE = process.env.NODE_ENV;

  afterEach(() => {
    // Restore env after each test so the gate state never leaks between tests.
    if (ENABLE === undefined) delete process.env.ENABLE_DEV_LOGIN;
    else process.env.ENABLE_DEV_LOGIN = ENABLE;
    if (NODE === undefined) delete process.env.NODE_ENV;
    else process.env.NODE_ENV = NODE;
  });

  it("404s when the opt-in flag is absent (fail-closed by default)", async () => {
    delete process.env.ENABLE_DEV_LOGIN;
    const res = await request(app)
      .post("/api/auth/dev-login")
      .send({ phone: randomPhone(), fullName: "Test User" });
    expect(res.status).toBe(404);
  });

  it("404s in production even with the opt-in flag set", async () => {
    process.env.NODE_ENV = "production";
    process.env.ENABLE_DEV_LOGIN = "true";
    const res = await request(app)
      .post("/api/auth/dev-login")
      .send({ phone: randomPhone(), fullName: "Test User" });
    expect(res.status).toBe(404);
  });

  it("requires a full name when registering a new number", async () => {
    process.env.ENABLE_DEV_LOGIN = "true";
    const phone = randomPhone();
    usedPhones.push(phone);
    const res = await request(app)
      .post("/api/auth/dev-login")
      .send({ phone });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe("registration_required");
  });

  it("creates an account and issues a session when enabled", async () => {
    process.env.ENABLE_DEV_LOGIN = "true";
    const phone = randomPhone();
    usedPhones.push(phone);

    const res = await request(app)
      .post("/api/auth/dev-login")
      .send({ phone, fullName: "Dev Tester" });

    expect(res.status).toBe(200);
    expect(typeof res.body.token).toBe("string");
    expect(res.body.token.length).toBeGreaterThan(0);
    expect(res.body.user.phone).toBe(phone);

    // Existing user can sign in again without re-sending the name.
    const again = await request(app)
      .post("/api/auth/dev-login")
      .send({ phone });
    expect(again.status).toBe(200);
    expect(again.body.user.id).toBe(res.body.user.id);
  });
});
