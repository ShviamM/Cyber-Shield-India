import crypto from "node:crypto";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { verifyPaymentSignature, verifyWebhookSignature } from "./razorpay";

const KEY_SECRET = "test_key_secret_abc123";
const WEBHOOK_SECRET = "test_webhook_secret_xyz789";

function hmacHex(secret: string, payload: string | Buffer): string {
  return crypto.createHmac("sha256", secret).update(payload).digest("hex");
}

describe("verifyPaymentSignature", () => {
  beforeEach(() => {
    process.env.RAZORPAY_KEY_ID = "rzp_test_key";
    process.env.RAZORPAY_KEY_SECRET = KEY_SECRET;
  });
  afterEach(() => {
    delete process.env.RAZORPAY_KEY_ID;
    delete process.env.RAZORPAY_KEY_SECRET;
  });

  it("accepts a signature computed over order_id|payment_id", () => {
    const orderId = "order_ABC";
    const paymentId = "pay_XYZ";
    const signature = hmacHex(KEY_SECRET, `${orderId}|${paymentId}`);
    expect(verifyPaymentSignature({ orderId, paymentId, signature })).toBe(true);
  });

  it("rejects a signature signed with the wrong secret", () => {
    const orderId = "order_ABC";
    const paymentId = "pay_XYZ";
    const signature = hmacHex("wrong_secret", `${orderId}|${paymentId}`);
    expect(verifyPaymentSignature({ orderId, paymentId, signature })).toBe(
      false,
    );
  });

  it("rejects a signature when the payment id is tampered", () => {
    const orderId = "order_ABC";
    const signature = hmacHex(KEY_SECRET, `${orderId}|pay_XYZ`);
    expect(
      verifyPaymentSignature({
        orderId,
        paymentId: "pay_TAMPERED",
        signature,
      }),
    ).toBe(false);
  });

  it("rejects a malformed (non-hex) signature", () => {
    expect(
      verifyPaymentSignature({
        orderId: "order_ABC",
        paymentId: "pay_XYZ",
        signature: "not-a-hex-signature",
      }),
    ).toBe(false);
  });
});

describe("verifyWebhookSignature", () => {
  beforeEach(() => {
    process.env.RAZORPAY_WEBHOOK_SECRET = WEBHOOK_SECRET;
  });
  afterEach(() => {
    delete process.env.RAZORPAY_WEBHOOK_SECRET;
  });

  it("accepts a signature computed over the raw body", () => {
    const rawBody = JSON.stringify({ event: "payment.captured" });
    const signature = hmacHex(WEBHOOK_SECRET, rawBody);
    expect(verifyWebhookSignature(rawBody, signature)).toBe(true);
  });

  it("accepts a Buffer raw body identical to the string body", () => {
    const rawBody = Buffer.from(JSON.stringify({ event: "order.paid" }));
    const signature = hmacHex(WEBHOOK_SECRET, rawBody);
    expect(verifyWebhookSignature(rawBody, signature)).toBe(true);
  });

  it("rejects when the body is tampered after signing", () => {
    const rawBody = JSON.stringify({ event: "payment.captured" });
    const signature = hmacHex(WEBHOOK_SECRET, rawBody);
    const tampered = JSON.stringify({ event: "payment.failed" });
    expect(verifyWebhookSignature(tampered, signature)).toBe(false);
  });

  it("rejects a missing signature header", () => {
    const rawBody = JSON.stringify({ event: "payment.captured" });
    expect(verifyWebhookSignature(rawBody, undefined)).toBe(false);
  });

  it("rejects a signature signed with the wrong secret", () => {
    const rawBody = JSON.stringify({ event: "payment.captured" });
    const signature = hmacHex("wrong_secret", rawBody);
    expect(verifyWebhookSignature(rawBody, signature)).toBe(false);
  });
});
