import { afterAll, describe, expect, it, vi } from "vitest";
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
