import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, usersTable } from "@workspace/db";
import { logger } from "../lib/logger";
import {
  isWebhookConfigured,
  verifyWebhookSignature,
} from "../lib/razorpay";
import {
  activateSubscriptionForOrder,
  markOrderFailed,
  reconcileRevenueCatSubscription,
} from "../lib/subscription";
import { type PlanKey } from "../lib/plans";

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

/** RevenueCat event types that mean the user has active, paid access. Anything
 * not listed (and not an explicit lapse/cancel) is ignored — only an
 * EXPIRATION event lapses a subscription to free. */
const ACTIVATING_EVENTS = new Set([
  "INITIAL_PURCHASE",
  "RENEWAL",
  "PRODUCT_CHANGE",
  "UNCANCELLATION",
  "NON_RENEWING_PURCHASE",
]);

/** Map a store product identifier to one of our plans. Play Store products carry
 * a "{subscriptionId}:{basePlanId}" suffix we strip first. */
function planFromProductId(productId: string | undefined): PlanKey | null {
  if (!productId) return null;
  const base = productId.split(":")[0];
  if (base === "premium_monthly") return "premium";
  if (base === "family_monthly") return "family";
  return null;
}

interface RevenueCatEvent {
  type?: string;
  app_user_id?: string;
  product_id?: string;
  expiration_at_ms?: number;
  store?: string;
}

/**
 * RevenueCat server-to-server webhook — the authoritative source of truth for
 * in-app (Google Play / App Store) subscriptions bought through the mobile app.
 * Authenticated with a shared bearer string configured both here and in the
 * RevenueCat dashboard. The client identifies itself to RevenueCat with our
 * `user.id` (Purchases.logIn), so `app_user_id` maps straight to a user row.
 * We always answer 200 quickly so RevenueCat does not retry-storm.
 */
router.post("/webhooks/revenuecat", async (req, res) => {
  const expected = process.env.REVENUECAT_WEBHOOK_AUTH;
  if (!expected) {
    res.status(503).json({ error: "revenuecat_webhook_not_configured" });
    return;
  }

  if (req.header("authorization") !== expected) {
    logger.warn("RevenueCat webhook authorization mismatch");
    res.status(401).json({ error: "unauthorized" });
    return;
  }

  const event = (req.body as { event?: RevenueCatEvent } | undefined)?.event;
  const type = event?.type ?? "";

  try {
    const userId = event?.app_user_id;
    // Anonymous RevenueCat ids ($RCAnonymousID:...) belong to users who never
    // logged in — nothing to reconcile against an account.
    if (userId && !userId.startsWith("$RCAnonymousID")) {
      const [user] = await db
        .select({ id: usersTable.id })
        .from(usersTable)
        .where(eq(usersTable.id, userId))
        .limit(1);

      if (user) {
        const periodEnd = event?.expiration_at_ms
          ? new Date(event.expiration_at_ms)
          : null;

        if (type === "EXPIRATION" || type === "SUBSCRIPTION_PAUSED") {
          // Entitlement has ended (or is paused) — lapse to free.
          await reconcileRevenueCatSubscription({
            userId: user.id,
            plan: "free",
            status: "expired",
            currentPeriodEnd: periodEnd,
            cancelAtPeriodEnd: false,
          });
        } else if (type === "CANCELLATION") {
          // Auto-renew turned off but access continues to the period end.
          const plan = planFromProductId(event?.product_id);
          if (plan) {
            await reconcileRevenueCatSubscription({
              userId: user.id,
              plan,
              status: "canceled",
              currentPeriodEnd: periodEnd,
              cancelAtPeriodEnd: true,
            });
          }
        } else if (ACTIVATING_EVENTS.has(type)) {
          // A purchase, renewal, plan change or uncancellation — actively paid.
          const plan = planFromProductId(event?.product_id);
          if (plan) {
            await reconcileRevenueCatSubscription({
              userId: user.id,
              plan,
              status: "active",
              currentPeriodEnd: periodEnd,
              cancelAtPeriodEnd: false,
            });
          }
        }
        // Other event types (TEST, TRANSFER, BILLING_ISSUE, SUBSCRIBER_ALIAS,
        // etc.) carry no actionable entitlement change here and are ignored;
        // a real lapse always arrives as EXPIRATION.
      } else {
        logger.warn({ userId }, "RevenueCat webhook for unknown user");
      }
    }
  } catch (err) {
    logger.error({ err, event: type }, "RevenueCat webhook handler error");
  }

  res.json({ received: true });
});

export default router;
