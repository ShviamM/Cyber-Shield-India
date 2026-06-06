import { and, eq, ne } from "drizzle-orm";
import {
  db,
  subscriptionsTable,
  paymentsTable,
  type Subscription,
  type Payment as DbPayment,
} from "@workspace/db";
import type {
  SubscriptionStatus,
  Payment as PaymentDto,
} from "@workspace/api-zod";
import { getPlan, addInterval, type PlanKey } from "./plans";

export type SubStatus = "active" | "canceled" | "expired" | "past_due";

export interface EffectiveSubscription {
  plan: PlanKey;
  status: SubStatus;
  currentPeriodStart: Date | null;
  currentPeriodEnd: Date | null;
  cancelAtPeriodEnd: boolean;
  isPremium: boolean;
}

const FREE_DEFAULT: EffectiveSubscription = {
  plan: "free",
  status: "active",
  currentPeriodStart: null,
  currentPeriodEnd: null,
  cancelAtPeriodEnd: false,
  isPremium: false,
};

export function isPaidPlan(plan: string): boolean {
  return Boolean(getPlan(plan)?.premium);
}

/** Compute the effective subscription from a stored row, accounting for expiry. */
function computeEffective(row: Subscription): EffectiveSubscription {
  if (!isPaidPlan(row.plan)) {
    return { ...FREE_DEFAULT };
  }
  const plan = row.plan as PlanKey;
  const end = row.currentPeriodEnd;
  const expired = end != null && end.getTime() <= Date.now();
  if (expired) {
    return {
      plan,
      status: "expired",
      currentPeriodStart: row.currentPeriodStart,
      currentPeriodEnd: end,
      cancelAtPeriodEnd: row.cancelAtPeriodEnd,
      isPremium: false,
    };
  }
  const status = row.status as SubStatus;
  // Within the paid period the user keeps access even after cancelling.
  const isPremium = status === "active" || status === "canceled";
  return {
    plan,
    status,
    currentPeriodStart: row.currentPeriodStart,
    currentPeriodEnd: end,
    cancelAtPeriodEnd: row.cancelAtPeriodEnd,
    isPremium,
  };
}

/** Load the user's subscription, lazily persisting an expiry transition. */
export async function getEffectiveSubscription(
  userId: string,
): Promise<EffectiveSubscription> {
  const [row] = await db
    .select()
    .from(subscriptionsTable)
    .where(eq(subscriptionsTable.userId, userId))
    .limit(1);
  if (!row) return { ...FREE_DEFAULT };

  const eff = computeEffective(row);
  if (eff.status === "expired" && row.status !== "expired") {
    await db
      .update(subscriptionsTable)
      .set({ status: "expired", updatedAt: new Date() })
      .where(eq(subscriptionsTable.id, row.id));
  }
  return eff;
}

export function toSubscriptionStatusDto(
  eff: EffectiveSubscription,
): SubscriptionStatus {
  return {
    plan: eff.plan,
    status: eff.status,
    currentPeriodStart: eff.currentPeriodStart,
    currentPeriodEnd: eff.currentPeriodEnd,
    cancelAtPeriodEnd: eff.cancelAtPeriodEnd,
    isPremium: eff.isPremium,
  };
}

export function toPaymentDto(p: DbPayment): PaymentDto {
  return {
    id: p.id,
    plan: p.plan,
    amount: p.amount,
    currency: p.currency,
    status: p.status as PaymentDto["status"],
    razorpayPaymentId: p.razorpayPaymentId,
    periodStart: p.periodStart,
    periodEnd: p.periodEnd,
    createdAt: p.createdAt,
  };
}

/**
 * Mark an order as paid and (re)activate the user's subscription. Safe to call
 * from both the verify endpoint and the webhook — the conditional update makes
 * activation idempotent so a period is never extended twice for one order.
 *
 * Returns the resulting effective subscription, or null when the order is
 * unknown. When the order was already paid, returns the current state unchanged.
 */
export async function activateSubscriptionForOrder(params: {
  orderId: string;
  paymentId: string;
  signature?: string | null;
  method?: string | null;
}): Promise<EffectiveSubscription | null> {
  const [payment] = await db
    .select()
    .from(paymentsTable)
    .where(eq(paymentsTable.razorpayOrderId, params.orderId))
    .limit(1);
  if (!payment) return null;

  // If already paid, do not extend again — just report the current state.
  if (payment.status === "paid") {
    return getEffectiveSubscription(payment.userId);
  }

  const plan = payment.plan as PlanKey;
  const def = getPlan(plan);
  if (!def || !def.premium) {
    return getEffectiveSubscription(payment.userId);
  }

  // Renewals extend from the later of "now" and any remaining paid period.
  const [existing] = await db
    .select()
    .from(subscriptionsTable)
    .where(eq(subscriptionsTable.userId, payment.userId))
    .limit(1);

  const now = new Date();
  let base = now;
  if (
    existing &&
    isPaidPlan(existing.plan) &&
    existing.currentPeriodEnd &&
    existing.currentPeriodEnd.getTime() > now.getTime()
  ) {
    base = existing.currentPeriodEnd;
  }
  const periodStart = base;
  const periodEnd = addInterval(base, def.interval);

  // Atomically claim the order (only if not already paid) to avoid double work.
  const [claimed] = await db
    .update(paymentsTable)
    .set({
      status: "paid",
      razorpayPaymentId: params.paymentId,
      razorpaySignature: params.signature ?? null,
      method: params.method ?? null,
      periodStart,
      periodEnd,
      updatedAt: now,
    })
    .where(
      and(
        eq(paymentsTable.razorpayOrderId, params.orderId),
        ne(paymentsTable.status, "paid"),
      ),
    )
    .returning();

  if (!claimed) {
    // Lost the race; another path already activated it.
    return getEffectiveSubscription(payment.userId);
  }

  // Upsert the subscription row to the active paid plan.
  let subscriptionId: string;
  if (existing) {
    await db
      .update(subscriptionsTable)
      .set({
        plan,
        status: "active",
        currentPeriodStart: periodStart,
        currentPeriodEnd: periodEnd,
        cancelAtPeriodEnd: false,
        updatedAt: now,
      })
      .where(eq(subscriptionsTable.id, existing.id));
    subscriptionId = existing.id;
  } else {
    const [created] = await db
      .insert(subscriptionsTable)
      .values({
        userId: payment.userId,
        plan,
        status: "active",
        currentPeriodStart: periodStart,
        currentPeriodEnd: periodEnd,
        cancelAtPeriodEnd: false,
      })
      .returning();
    subscriptionId = created.id;
  }

  // Link the payment to the subscription for history.
  await db
    .update(paymentsTable)
    .set({ subscriptionId })
    .where(eq(paymentsTable.id, claimed.id));

  return getEffectiveSubscription(payment.userId);
}

/**
 * Reconcile a subscription that was bought through an app store (Google Play /
 * App Store) via RevenueCat. Unlike the Razorpay flow there is no order to
 * verify — RevenueCat's webhook is the authoritative source — so we upsert the
 * user's subscription row directly. Idempotent: re-delivering the same event
 * just re-applies the same state.
 */
export async function reconcileRevenueCatSubscription(params: {
  userId: string;
  plan: PlanKey;
  status: SubStatus;
  currentPeriodEnd: Date | null;
  cancelAtPeriodEnd: boolean;
}): Promise<void> {
  const now = new Date();
  const [existing] = await db
    .select()
    .from(subscriptionsTable)
    .where(eq(subscriptionsTable.userId, params.userId))
    .limit(1);

  if (existing) {
    await db
      .update(subscriptionsTable)
      .set({
        plan: params.plan,
        status: params.status,
        currentPeriodStart: existing.currentPeriodStart ?? now,
        currentPeriodEnd: params.currentPeriodEnd,
        cancelAtPeriodEnd: params.cancelAtPeriodEnd,
        updatedAt: now,
      })
      .where(eq(subscriptionsTable.id, existing.id));
  } else {
    await db.insert(subscriptionsTable).values({
      userId: params.userId,
      plan: params.plan,
      status: params.status,
      currentPeriodStart: now,
      currentPeriodEnd: params.currentPeriodEnd,
      cancelAtPeriodEnd: params.cancelAtPeriodEnd,
    });
  }
}

/** Mark an order's payment as failed (best-effort; idempotent-friendly). */
export async function markOrderFailed(orderId: string): Promise<void> {
  await db
    .update(paymentsTable)
    .set({ status: "failed", updatedAt: new Date() })
    .where(
      and(
        eq(paymentsTable.razorpayOrderId, orderId),
        ne(paymentsTable.status, "paid"),
      ),
    );
}
