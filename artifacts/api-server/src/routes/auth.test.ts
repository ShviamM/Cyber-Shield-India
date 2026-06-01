import { afterAll, describe, expect, it, vi } from "vitest";
import request from "supertest";
import { eq } from "drizzle-orm";

/**
 * Control the SMS sender per-test. The mock replaces the real provider so we can
 * simulate delivery success/failure without touching Twilio. Must be declared
 * before importing `app` so the route picks up the mocked `smsSender`.
 */
const sendOtp = vi.fn<(phone: string, code: string) => Promise<void>>();
vi.mock("../lib/sms", () => ({
  smsSender: { sendOtp: (phone: string, code: string) => sendOtp(phone, code) },
}));

const { default: app } = await import("../app");
const { db, otpCodesTable } = await import("@workspace/db");

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
    await db.delete(otpCodesTable).where(eq(otpCodesTable.phone, phone));
  }
});

async function otpRowsFor(phone: string) {
  return db.select().from(otpCodesTable).where(eq(otpCodesTable.phone, phone));
}

describe("POST /auth/request-otp SMS delivery handling", () => {
  it("deletes the OTP row and returns 502 when delivery fails", async () => {
    const phone = randomPhone();
    usedPhones.push(phone);
    sendOtp.mockRejectedValueOnce(new Error("Twilio send failed"));

    const res = await request(app).post("/api/auth/request-otp").send({ phone });

    expect(res.status).toBe(502);
    expect(res.body.error).toBe("sms_delivery_failed");
    // The failed attempt must not linger, otherwise it counts toward the resend
    // cooldown / hourly cap and locks the user out without a code.
    expect(await otpRowsFor(phone)).toHaveLength(0);
  });

  it("keeps the OTP row when delivery succeeds", async () => {
    const phone = randomPhone();
    usedPhones.push(phone);
    sendOtp.mockResolvedValueOnce(undefined);

    const res = await request(app).post("/api/auth/request-otp").send({ phone });

    expect(res.status).toBe(200);
    expect(sendOtp).toHaveBeenCalledWith(phone, expect.any(String));
    expect(await otpRowsFor(phone)).toHaveLength(1);
  });
});
