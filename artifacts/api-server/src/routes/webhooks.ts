import { Router, type IRouter } from "express";
import { logger } from "../lib/logger";
import {
  isWebhookConfigured,
  verifyWebhookSignature,
} from "../lib/razorpay";
import {
  activateSubscriptionForOrder,
  markOrderFailed,
} from "../lib/subscription";

const router: IRouter = Router();

interface RazorpayPaymentEntity {
  id?: string;
  order_id?: string;
  method?: string;
}

interface RazorpayWebhookEvent {
  event?: string;
  payload?: {
    payment?: { entity?: RazorpayPaymentEntity };
    order?: { entity?: { id?: string } };
  };
}

/**
 * Razorpay server-to-server webhook. This is the authoritative confirmation of
 * payment — the signature is verified with the webhook secret before anything
 * is trusted. We always answer 200 quickly so Razorpay does not retry storms.
 */
router.post("/webhooks/razorpay", async (req, res) => {
  if (!isWebhookConfigured()) {
    res.status(503).json({ error: "razorpay_webhook_not_configured" });
    return;
  }

  const signature = req.header("x-razorpay-signature");
  const raw = req.rawBody;
  if (!raw) {
    logger.warn("Razorpay webhook missing raw body");
    res.status(400).json({ error: "invalid_payload" });
    return;
  }

  if (!verifyWebhookSignature(raw, signature)) {
    logger.warn("Razorpay webhook signature verification failed");
    res.status(400).json({ error: "invalid_signature" });
    return;
  }

  const event = req.body as RazorpayWebhookEvent;
  const name = event.event ?? "";

  try {
    if (name === "payment.captured" || name === "order.paid") {
      const entity = event.payload?.payment?.entity;
      const orderId = entity?.order_id ?? event.payload?.order?.entity?.id;
      const paymentId = entity?.id;
      if (orderId && paymentId) {
        await activateSubscriptionForOrder({
          orderId,
          paymentId,
          method: entity?.method ?? null,
        });
      }
    } else if (name === "payment.failed") {
      const orderId = event.payload?.payment?.entity?.order_id;
      if (orderId) {
        await markOrderFailed(orderId);
      }
    }
  } catch (err) {
    // Log but still acknowledge: a 5xx makes Razorpay retry, and our handlers
    // are idempotent, so retries are safe — but noisy. Acknowledge and move on.
    logger.error({ err, event: name }, "Razorpay webhook handler error");
  }

  res.json({ received: true });
});

export default router;
