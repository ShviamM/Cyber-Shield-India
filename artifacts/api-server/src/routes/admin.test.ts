import { afterAll, beforeAll, describe, expect, it } from "vitest";
import request from "supertest";
import { eq } from "drizzle-orm";
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
});

afterAll(async () => {
  await db
    .delete(fraudReportsTable)
    .where(eq(fraudReportsTable.phone, scamPhone));
  await db
    .delete(numberReputationTable)
    .where(eq(numberReputationTable.phone, scamPhone));
  await db.delete(sessionsTable).where(eq(sessionsTable.userId, adminId));
  await db.delete(usersTable).where(eq(usersTable.id, adminId));
  await db.delete(usersTable).where(eq(usersTable.id, reporterId));
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
