import { Router, type IRouter } from "express";
import { desc, eq } from "drizzle-orm";
import { db, paymentsTable, subscriptionsTable } from "@workspace/db";
import {
  CreateSubscriptionOrderBody,
  VerifySubscriptionPaymentBody,
  type SubscriptionPlanList,
  type SubscriptionOrder,
  type PaymentList,
} from "@workspace/api-zod";
import { HttpError } from "../lib/http-error";
import { requireAuth } from "../middlewares/auth";
import { PLAN_KEYS, PLANS, getPlan } from "../lib/plans";
import {
  createOrder,
  getPublicKeyId,
  verifyPaymentSignature,
} from "../lib/razorpay";
import {
  activateSubscriptionForOrder,
  getEffectiveSubscription,
  toPaymentDto,
  toSubscriptionStatusDto,
} from "../lib/subscription";

const router: IRouter = Router();

// Public: the plan catalogue (server-authoritative pricing).
router.get("/subscription/plans", (_req, res) => {
  const response: SubscriptionPlanList = {
    plans: PLAN_KEYS.map((key) => {
      const p = PLANS[key];
      return {
        key: p.key,
        amount: p.amount,
        currency: p.currency,
        interval: p.interval,
        premium: p.premium,
      };
    }),
  };
  res.json(response);
});

// Current user's subscription status.
router.get("/subscription", requireAuth, async (req, res) => {
  const user = req.user!;
  const sub = await getEffectiveSubscription(user.id);
  res.json(toSubscriptionStatusDto(sub));
});

// Create a Razorpay order for a paid plan.
router.post("/subscription/order", requireAuth, async (req, res) => {
  const user = req.user!;
  const body = CreateSubscriptionOrderBody.parse(req.body);

  const def = getPlan(body.plan);
  if (!def || !def.premium || def.amount <= 0) {
    throw new HttpError(
      400,
      "invalid_plan",
      "Choose a paid plan (Premium or Family) to upgrade.",
    );
  }

  const receipt = `sub_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

  const order = await createOrder({
    amount: def.amount,
    currency: def.currency,
    receipt,
    notes: { userId: user.id, plan: def.key },
  });

  await db.insert(paymentsTable).values({
    userId: user.id,
    plan: def.key,
    razorpayOrderId: order.id,
    amount: def.amount,
    currency: def.currency,
    status: "created",
  });

  const response: SubscriptionOrder = {
    orderId: order.id,
    amount: order.amount,
    currency: order.currency,
    keyId: getPublicKeyId(),
    plan: def.key as SubscriptionOrder["plan"],
  };
  res.json(response);
});

// Verify a checkout payment server-side and activate the subscription.
router.post("/subscription/verify", requireAuth, async (req, res) => {
  const user = req.user!;
  const body = VerifySubscriptionPaymentBody.parse(req.body);

  // The order must belong to this user.
  const [payment] = await db
    .select()
    .from(paymentsTable)
    .where(eq(paymentsTable.razorpayOrderId, body.orderId))
    .limit(1);
  if (!payment || payment.userId !== user.id) {
    throw new HttpError(404, "order_not_found", "Payment order not found.");
  }

  // Never trust the client: verify the signature against our secret.
  const valid = verifyPaymentSignature({
    orderId: body.orderId,
    paymentId: body.paymentId,
    signature: body.signature,
  });
  if (!valid) {
    throw new HttpError(
      400,
      "invalid_signature",
      "Payment could not be verified. If money was deducted it will be refunded.",
    );
  }

  const sub = await activateSubscriptionForOrder({
    orderId: body.orderId,
    paymentId: body.paymentId,
    signature: body.signature,
  });
  if (!sub) {
    throw new HttpError(404, "order_not_found", "Payment order not found.");
  }

  res.json(toSubscriptionStatusDto(sub));
});

// Cancel auto-renewal; access continues until the period ends.
router.post("/subscription/cancel", requireAuth, async (req, res) => {
  const user = req.user!;
  const sub = await getEffectiveSubscription(user.id);
  if (!sub.isPremium) {
    throw new HttpError(
      400,
      "no_active_subscription",
      "You do not have an active paid subscription to cancel.",
    );
  }

  await db
    .update(subscriptionsTable)
    .set({
      status: "canceled",
      cancelAtPeriodEnd: true,
      updatedAt: new Date(),
    })
    .where(eq(subscriptionsTable.userId, user.id));

  const updated = await getEffectiveSubscription(user.id);
  res.json(toSubscriptionStatusDto(updated));
});

// History of the user's payments.
router.get("/subscription/payments", requireAuth, async (req, res) => {
  const user = req.user!;
  const rows = await db
    .select()
    .from(paymentsTable)
    .where(eq(paymentsTable.userId, user.id))
    .orderBy(desc(paymentsTable.createdAt))
    .limit(100);
  const response: PaymentList = { payments: rows.map(toPaymentDto) };
  res.json(response);
});

export default router;
