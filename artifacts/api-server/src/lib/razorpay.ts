import crypto from "node:crypto";
import { HttpError } from "./http-error";

/**
 * Thin wrapper over the Razorpay REST API + signature verification helpers.
 *
 * Keys are read lazily so the server boots even before the secrets are set; any
 * endpoint that actually needs Razorpay throws a clear 503 until configured.
 */

const RAZORPAY_API = "https://api.razorpay.com/v1";

interface RazorpayConfig {
  keyId: string;
  keySecret: string;
  webhookSecret: string;
}

function readConfig(): Partial<RazorpayConfig> {
  return {
    keyId: (process.env.RAZORPAY_KEY_ID ?? "").trim(),
    keySecret: (process.env.RAZORPAY_KEY_SECRET ?? "").trim(),
    webhookSecret: (process.env.RAZORPAY_WEBHOOK_SECRET ?? "").trim(),
  };
}

export function isRazorpayConfigured(): boolean {
  const c = readConfig();
  return Boolean(c.keyId && c.keySecret);
}

export function isWebhookConfigured(): boolean {
  return Boolean(readConfig().webhookSecret);
}

/** The public key id, safe to hand to the mobile checkout SDK. */
export function getPublicKeyId(): string {
  const { keyId } = readConfig();
  if (!keyId) {
    throw new HttpError(
      503,
      "razorpay_not_configured",
      "Payments are not configured yet. Please try again later.",
    );
  }
  return keyId;
}

function requireConfig(): RazorpayConfig {
  const c = readConfig();
  if (!c.keyId || !c.keySecret) {
    throw new HttpError(
      503,
      "razorpay_not_configured",
      "Payments are not configured yet. Please try again later.",
    );
  }
  return c as RazorpayConfig;
}

function requireWebhookSecret(): string {
  const secret = readConfig().webhookSecret;
  if (!secret) {
    throw new HttpError(
      503,
      "razorpay_webhook_not_configured",
      "Payment webhook is not configured.",
    );
  }
  return secret;
}

export interface RazorpayOrder {
  id: string;
  amount: number;
  currency: string;
  status: string;
  receipt?: string | null;
}

/** Create a Razorpay order (the server-authoritative amount for a checkout). */
export async function createOrder(params: {
  amount: number;
  currency: string;
  receipt: string;
  notes?: Record<string, string>;
}): Promise<RazorpayOrder> {
  const { keyId, keySecret } = requireConfig();
  const auth = Buffer.from(`${keyId}:${keySecret}`).toString("base64");

  const res = await fetch(`${RAZORPAY_API}/orders`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      amount: params.amount,
      currency: params.currency,
      receipt: params.receipt,
      notes: params.notes ?? {},
      payment_capture: 1,
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new HttpError(
      502,
      "razorpay_order_failed",
      `Could not create payment order (${res.status}). ${text.slice(0, 200)}`,
    );
  }

  return (await res.json()) as RazorpayOrder;
}

/**
 * Verify the checkout callback signature: HMAC-SHA256(order_id|payment_id) keyed
 * by the API secret. Constant-time comparison to avoid timing leaks.
 */
export function verifyPaymentSignature(params: {
  orderId: string;
  paymentId: string;
  signature: string;
}): boolean {
  const { keySecret } = requireConfig();
  const expected = crypto
    .createHmac("sha256", keySecret)
    .update(`${params.orderId}|${params.paymentId}`)
    .digest("hex");
  return safeEqualHex(expected, params.signature);
}

/**
 * Verify a webhook payload: HMAC-SHA256(rawBody) keyed by the webhook secret,
 * compared against the X-Razorpay-Signature header.
 */
export function verifyWebhookSignature(
  rawBody: Buffer | string,
  signature: string | undefined,
): boolean {
  if (!signature) return false;
  const secret = requireWebhookSecret();
  const expected = crypto
    .createHmac("sha256", secret)
    .update(rawBody)
    .digest("hex");
  return safeEqualHex(expected, signature);
}

function safeEqualHex(a: string, b: string): boolean {
  if (typeof a !== "string" || typeof b !== "string") return false;
  const bufA = Buffer.from(a, "hex");
  const bufB = Buffer.from(b, "hex");
  if (bufA.length !== bufB.length || bufA.length === 0) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}
