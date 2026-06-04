import { afterAll, beforeAll, describe, expect, it } from "vitest";
import request from "supertest";
import { eq, gte, sql } from "drizzle-orm";
import {
  db,
  fraudReportsTable,
  numberReputationTable,
  sessionsTable,
  usersTable,
} from "@workspace/db";
import app from "../app";
import { hashToken } from "../lib/token";

/**
 * Build a random 10-digit Indian mobile (starts 6-9) in E.164 form, matching
 * how the API normalizes and stores phone numbers. Random suffixes keep test
 * rows isolated from any existing data in the shared dev database.
 */
function randomPhone(): string {
  const first = 6 + Math.floor(Math.random() * 4);
  const rest = Math.floor(Math.random() * 1_000_000_000)
    .toString()
    .padStart(9, "0");
  return `+91${first}${rest}`;
}

const adminToken = `test-admin-${Math.random().toString(36).slice(2)}`;
const adminPhone = randomPhone();
const reporterPhone = randomPhone();
const scamPhone = randomPhone();

let adminId: string;
let reporterId: string;
let stalePhone: string;
let staleUserId: string;

beforeAll(async () => {
  const [admin] = await db
    .insert(usersTable)
    .values({ fullName: "Test Admin", phone: adminPhone, isAdmin: true })
    .returning();
  adminId = admin.id;

  const [reporter] = await db
    .insert(usersTable)
    .values({ fullName: "Test Reporter", phone: reporterPhone })
    .returning();
  reporterId = reporter.id;

  await db.insert(sessionsTable).values({
    userId: adminId,
    tokenHash: hashToken(adminToken),
    expiresAt: new Date(Date.now() + 60 * 60 * 1000),
  });

  await db.insert(fraudReportsTable).values({
    reporterId,
    phone: scamPhone,
    categoryKey: "upi_fraud",
    description: "Test scam report for blacklist coverage",
    status: "pending",
  });

  // A user whose only session was created >24h ago: should NOT count as a
  // daily active user, which proves the metric uses a 24h login window.
  stalePhone = randomPhone();
  const [stale] = await db
    .insert(usersTable)
    .values({ fullName: "Stale Session User", phone: stalePhone })
    .returning();
  staleUserId = stale.id;
  await db.insert(sessionsTable).values({
    userId: staleUserId,
    tokenHash: hashToken(`test-stale-${Math.random().toString(36).slice(2)}`),
    expiresAt: new Date(Date.now() + 60 * 60 * 1000),
    createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000),
  });
});

afterAll(async () => {
  await db
    .delete(fraudReportsTable)
    .where(eq(fraudReportsTable.phone, scamPhone));
  await db
    .delete(numberReputationTable)
    .where(eq(numberReputationTable.phone, scamPhone));
  await db.delete(sessionsTable).where(eq(sessionsTable.userId, adminId));
  await db.delete(sessionsTable).where(eq(sessionsTable.userId, staleUserId));
  await db.delete(usersTable).where(eq(usersTable.id, adminId));
  await db.delete(usersTable).where(eq(usersTable.id, reporterId));
  await db.delete(usersTable).where(eq(usersTable.id, staleUserId));
});

async function getReputation(phone: string) {
  const [row] = await db
    .select()
    .from(numberReputationTable)
    .where(eq(numberReputationTable.phone, phone))
    .limit(1);
  return row;
}

describe("POST /admin/numbers/:phone/verify", () => {
  it("flips number_reputation.verifiedScam on, then off", async () => {
    const on = await request(app)
      .post(`/api/admin/numbers/${encodeURIComponent(scamPhone)}/verify`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ verifiedScam: true });

    expect(on.status).toBe(200);
    expect(on.body.verifiedScam).toBe(true);
    expect(on.body.phone).toBe(scamPhone);
    expect((await getReputation(scamPhone)).verifiedScam).toBe(true);

    const off = await request(app)
      .post(`/api/admin/numbers/${encodeURIComponent(scamPhone)}/verify`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ verifiedScam: false });

    expect(off.status).toBe(200);
    expect(off.body.verifiedScam).toBe(false);
    expect((await getReputation(scamPhone)).verifiedScam).toBe(false);
  });
});

describe("GET /admin/stats", () => {
  it("returns numeric dashboard metrics reflecting seeded data", async () => {
    const res = await request(app)
      .get(`/api/admin/stats`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    for (const key of [
      "totalUsers",
      "premiumUsers",
      "fraudReports",
      "blockedNumbers",
      "revenuePaise",
      "dailyActiveUsers",
    ]) {
      expect(typeof res.body[key]).toBe("number");
      expect(res.body[key]).toBeGreaterThanOrEqual(0);
    }
    // We seeded two users, one fraud report, and one fresh admin session.
    expect(res.body.totalUsers).toBeGreaterThanOrEqual(2);
    expect(res.body.fraudReports).toBeGreaterThanOrEqual(1);
    expect(res.body.dailyActiveUsers).toBeGreaterThanOrEqual(1);
  });

  it("rejects requests without an admin session", async () => {
    const res = await request(app).get(`/api/admin/stats`);
    expect(res.status).toBe(401);
  });

  it("counts daily active users as distinct logins in the last 24h (excludes stale sessions)", async () => {
    const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const [{ value: expected }] = await db
      .select({ value: sql<string>`count(distinct ${sessionsTable.userId})` })
      .from(sessionsTable)
      .where(gte(sessionsTable.createdAt, dayAgo));

    const res = await request(app)
      .get(`/api/admin/stats`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    // Endpoint matches a freshly recomputed 24h window, so the stale-session
    // user (created 48h ago) is necessarily excluded from the count.
    expect(res.body.dailyActiveUsers).toBe(Number(expected));
  });
});

describe("GET /admin/reports", () => {
  it("returns verifiedScam on each report matching the reputation table", async () => {
    await request(app)
      .post(`/api/admin/numbers/${encodeURIComponent(scamPhone)}/verify`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ verifiedScam: true })
      .expect(200);

    const res = await request(app)
      .get(`/api/admin/reports`)
      .query({ phone: scamPhone })
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.reports.length).toBeGreaterThan(0);

    const reputation = await getReputation(scamPhone);
    for (const report of res.body.reports) {
      expect(report).toHaveProperty("verifiedScam");
      expect(report.phone).toBe(scamPhone);
      expect(report.verifiedScam).toBe(reputation.verifiedScam);
      expect(report.verifiedScam).toBe(true);
    }
  });
});
