import type { SubscriptionOrder } from "@workspace/api-client-react";

const CHECKOUT_SRC = "https://checkout.razorpay.com/v1/checkout.js";

// Deep navy brand colour (matches --primary in index.css).
const THEME_COLOR = "#0B3D91";

interface RazorpaySuccess {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  prefill?: { name?: string; contact?: string; email?: string };
  notes?: Record<string, string>;
  theme?: { color?: string };
  handler: (response: RazorpaySuccess) => void;
  modal?: { ondismiss?: () => void };
}

interface RazorpayInstance {
  open: () => void;
  on: (event: string, handler: (response: unknown) => void) => void;
}

interface RazorpayWindow {
  Razorpay?: new (options: RazorpayOptions) => RazorpayInstance;
}

function rzpWindow(): RazorpayWindow {
  return window as unknown as RazorpayWindow;
}

let scriptPromise: Promise<void> | null = null;

function loadCheckout(): Promise<void> {
  if (scriptPromise) return scriptPromise;
  scriptPromise = new Promise<void>((resolve, reject) => {
    if (rzpWindow().Razorpay) {
      resolve();
      return;
    }
    const script = document.createElement("script");
    script.src = CHECKOUT_SRC;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () =>
      reject(new Error("Could not load the payment gateway. Please try again."));
    document.head.appendChild(script);
  });
  return scriptPromise;
}

export interface VerifiedPayment {
  orderId: string;
  paymentId: string;
  signature: string;
}

/**
 * Opens Razorpay Standard Checkout for the given order. Resolves with the
 * payment identifiers (for server-side signature verification) on success,
 * rejects if the user dismisses the modal or the payment fails.
 */
export async function openCheckout(params: {
  order: SubscriptionOrder;
  planLabel: string;
  prefill?: { name?: string; contact?: string };
}): Promise<VerifiedPayment> {
  await loadCheckout();
  const Razorpay = rzpWindow().Razorpay;
  if (!Razorpay) {
    throw new Error("Could not load the payment gateway. Please try again.");
  }

  const { order, planLabel, prefill } = params;

  return new Promise<VerifiedPayment>((resolve, reject) => {
    let settled = false;
    const checkout = new Razorpay({
      key: order.keyId,
      amount: order.amount,
      currency: order.currency,
      name: "Netraksh",
      description: `${planLabel} subscription`,
      order_id: order.orderId,
      prefill,
      theme: { color: THEME_COLOR },
      handler: (response) => {
        settled = true;
        resolve({
          orderId: response.razorpay_order_id,
          paymentId: response.razorpay_payment_id,
          signature: response.razorpay_signature,
        });
      },
      modal: {
        ondismiss: () => {
          if (!settled) reject(new Error("Payment cancelled."));
        },
      },
    });

    checkout.on("payment.failed", (response) => {
      settled = true;
      const description =
        (response as { error?: { description?: string } })?.error?.description ??
        "Payment failed. Please try again.";
      reject(new Error(description));
    });

    checkout.open();
  });
}
