import { and, eq, ne, sql } from "drizzle-orm";
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
import { getPlan, addInterval, TRIAL_DAYS, type PlanKey } from "./plans";

export type SubStatus =
  | "active"
  | "canceled"
  | "expired"
  | "past_due"
  | "trialing";

export interface EffectiveSubscription {
  plan: PlanKey;
  status: SubStatus;
  currentPeriodStart: Date | null;
  currentPeriodEnd: Date | null;
  cancelAtPeriodEnd: boolean;
  isPremium: boolean;
  /** True when the user can still start their one free trial. */
  trialEligible: boolean;
}

const FREE_DEFAULT: EffectiveSubscription = {
  plan: "free",
  status: "active",
  currentPeriodStart: null,
  currentPeriodEnd: null,
  cancelAtPeriodEnd: false,
  isPremium: false,
  // A user with no subscription row has never trialed and is not paying.
  trialEligible: true,
};

export function isPaidPlan(plan: string): boolean {
  return Boolean(getPlan(plan)?.premium);
}

/**
 * Whether the user can still start their single free trial. Eligible only when
 * the user has never trialed, is not currently premium, has no paid Razorpay
 * payment, and shows no evidence of a prior paid entitlement from any channel.
 * (No row at all is handled by FREE_DEFAULT.)
 *
 * The last guard closes a cross-channel gap: app-store purchases reconciled via
 * RevenueCat update the subscription row but never create a `payments` row, so a
 * lapsed mobile subscriber would otherwise look trial-eligible. A paid plan that
 * carries a real period end but no `trialStartedAt` can only have come from a
 * paid activation (Razorpay or RevenueCat) — trials always stamp trialStartedAt
 * — so we treat it as a prior paid entitlement and deny a second free trial.
 */
function computeTrialEligible(
  row: Subscription,
  isPremium: boolean,
  hasPaidPayment: boolean,
): boolean {
  const hadPaidEntitlement =
    isPaidPlan(row.plan) && row.currentPeriodEnd != null;
  return (
    row.trialStartedAt == null &&
    !isPremium &&
    !hasPaidPayment &&
    !hadPaidEntitlement
  );
}

/** Compute the effective subscription from a stored row, accounting for expiry. */
function computeEffective(
  row: Subscription,
  hasPaidPayment: boolean,
): EffectiveSubscription {
  if (!isPaidPlan(row.plan)) {
    return {
      ...FREE_DEFAULT,
      trialEligible: computeTrialEligible(row, false, hasPaidPayment),
    };
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
      trialEligible: computeTrialEligible(row, false, hasPaidPayment),
    };
  }
  const status = row.status as SubStatus;
  // Within the paid period the user keeps access even after cancelling. A
  // running trial also unlocks premium until it ends.
  const isPremium =
    status === "active" || status === "canceled" || status === "trialing";
  return {
    plan,
    status,
    currentPeriodStart: row.currentPeriodStart,
    currentPeriodEnd: end,
    cancelAtPeriodEnd: row.cancelAtPeriodEnd,
    isPremium,
    trialEligible: computeTrialEligible(row, isPremium, hasPaidPayment),
  };
}

/** Count of paid payments for a user — used to gate trial eligibility. */
async function hasPaidPayment(userId: string): Promise<boolean> {
  const [row] = await db
    .select({ value: sql<string>`count(*)` })
    .from(paymentsTable)
    .where(
      and(eq(paymentsTable.userId, userId), eq(paymentsTable.status, "paid")),
    );
  return Number(row?.value ?? 0) > 0;
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

  const paid = await hasPaidPayment(userId);
  const eff = computeEffective(row, paid);
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
    trialEligible: eff.trialEligible,
  };
}

/**
 * Start a one-time, no-card free trial for the user. Grants TRIAL_DAYS of the
 * chosen paid plan with no payment; when it lapses the user must pay to keep
 * premium. Throws when the user is not eligible (already trialed or paying).
 */
export async function startTrial(
  userId: string,
  plan: PlanKey,
): Promise<EffectiveSubscription | null> {
  const def = getPlan(plan);
  if (!def || !def.premium) return null;

  const eff = await getEffectiveSubscription(userId);
  if (!eff.trialEligible) return null;

  const now = new Date();
  const periodEnd = new Date(now);
  periodEnd.setDate(periodEnd.getDate() + TRIAL_DAYS);

  const [existing] = await db
    .select()
    .from(subscriptionsTable)
    .where(eq(subscriptionsTable.userId, userId))
    .limit(1);

  // Write the trial atomically so two concurrent requests can never grant two
  // trials. Both paths are guarded so that only the first writer wins; a loser
  // simply falls through and returns whatever state the winner committed.
  if (existing) {
    // Only flip to trialing while no trial has been stamped yet. A concurrent
    // request that already set trialStartedAt makes this WHERE match nothing.
    await db
      .update(subscriptionsTable)
      .set({
        plan,
        status: "trialing",
        currentPeriodStart: now,
        currentPeriodEnd: periodEnd,
        cancelAtPeriodEnd: false,
        trialStartedAt: now,
        updatedAt: now,
      })
      .where(
        and(
          eq(subscriptionsTable.id, existing.id),
          sql`${subscriptionsTable.trialStartedAt} is null`,
        ),
      );
  } else {
    // No row yet: insert, but if a concurrent request inserted first the unique
    // userId index turns this into a no-op instead of a 500.
    await db
      .insert(subscriptionsTable)
      .values({
        userId,
        plan,
        status: "trialing",
        currentPeriodStart: now,
        currentPeriodEnd: periodEnd,
        cancelAtPeriodEnd: false,
        trialStartedAt: now,
      })
      .onConflictDoNothing({ target: subscriptionsTable.userId });
  }

  return getEffectiveSubscription(userId);
}

export interface AdminTrialResult {
  effective: EffectiveSubscription;
  /** Subscription status before the change ("none" when no row existed). */
  previousStatus: SubStatus | "none";
  previousEnd: Date | null;
  newEnd: Date | null;
  plan: PlanKey;
}

/** Error thrown when an admin trial action is not allowed for the user's state. */
export class TrialActionError extends Error {
  constructor(
    public readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = "TrialActionError";
  }
}

/**
 * Guard: a currently-paying subscriber must never be silently downgraded to a
 * trial. Refuse trial grants/resets while a paid plan is still active.
 */
function assertNotActivePaid(row: Subscription | undefined): void {
  if (!row) return;
  const liveEnd =
    row.currentPeriodEnd != null && row.currentPeriodEnd.getTime() > Date.now();
  if (isPaidPlan(row.plan) && row.status === "active" && liveEnd) {
    throw new TrialActionError(
      "active_subscriber",
      "This user has an active paid subscription. Manage their plan instead of granting a trial.",
    );
  }
}

/**
 * Admin-granted trial. `extend` adds days from the later of now and any live
 * period end (so an active trial is lengthened); `activate` always starts a
 * fresh window from now (reactivating an expired or never-started trial). Either
 * mode unlocks premium immediately. Refuses to downgrade active paid subscribers.
 */
export async function adminGrantTrial(params: {
  userId: string;
  plan: PlanKey;
  days: number;
  mode: "extend" | "activate";
}): Promise<AdminTrialResult> {
  const def = getPlan(params.plan);
  if (!def || !def.premium) {
    throw new TrialActionError("invalid_plan", "Trials require a paid plan.");
  }
  if (!Number.isInteger(params.days) || params.days <= 0 || params.days > 365) {
    throw new TrialActionError(
      "invalid_days",
      "Days must be a whole number between 1 and 365.",
    );
  }

  const now = new Date();
  const [existing] = await db
    .select()
    .from(subscriptionsTable)
    .where(eq(subscriptionsTable.userId, params.userId))
    .limit(1);

  assertNotActivePaid(existing);

  const previousStatus: SubStatus | "none" = existing
    ? (existing.status as SubStatus)
    : "none";
  const previousEnd = existing?.currentPeriodEnd ?? null;

  let base = now;
  if (
    params.mode === "extend" &&
    existing?.currentPeriodEnd &&
    existing.currentPeriodEnd.getTime() > now.getTime()
  ) {
    base = existing.currentPeriodEnd;
  }
  const newEnd = new Date(base);
  newEnd.setDate(newEnd.getDate() + params.days);

  if (existing) {
    await db
      .update(subscriptionsTable)
      .set({
        plan: params.plan,
        status: "trialing",
        currentPeriodStart: existing.currentPeriodStart ?? now,
        currentPeriodEnd: newEnd,
        cancelAtPeriodEnd: false,
        trialStartedAt: existing.trialStartedAt ?? now,
        updatedAt: now,
      })
      .where(eq(subscriptionsTable.id, existing.id));
  } else {
    await db
      .insert(subscriptionsTable)
      .values({
        userId: params.userId,
        plan: params.plan,
        status: "trialing",
        currentPeriodStart: now,
        currentPeriodEnd: newEnd,
        cancelAtPeriodEnd: false,
        trialStartedAt: now,
      })
      .onConflictDoNothing({ target: subscriptionsTable.userId });
  }

  const effective = await getEffectiveSubscription(params.userId);
  return { effective, previousStatus, previousEnd, newEnd, plan: params.plan };
}

/**
 * Reset a user's trial so they become eligible to start a fresh free trial from
 * the app. Clears the trial stamp and drops the row back to free/expired.
 * Refuses to wipe an active paid subscription.
 */
export async function adminResetTrial(userId: string): Promise<{
  effective: EffectiveSubscription;
  previousStatus: SubStatus | "none";
  previousEnd: Date | null;
}> {
  const [existing] = await db
    .select()
    .from(subscriptionsTable)
    .where(eq(subscriptionsTable.userId, userId))
    .limit(1);

  assertNotActivePaid(existing);

  const previousStatus: SubStatus | "none" = existing
    ? (existing.status as SubStatus)
    : "none";
  const previousEnd = existing?.currentPeriodEnd ?? null;

  if (existing) {
    await db
      .update(subscriptionsTable)
      .set({
        plan: "free",
        status: "expired",
        currentPeriodStart: null,
        currentPeriodEnd: null,
        cancelAtPeriodEnd: false,
        trialStartedAt: null,
        updatedAt: new Date(),
      })
      .where(eq(subscriptionsTable.id, existing.id));
  }

  const effective = await getEffectiveSubscription(userId);
  return { effective, previousStatus, previousEnd };
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
    // Guard against out-of-order webhook delivery: RevenueCat retries can land
    // an older event after a newer one. The freshest truth always carries the
    // latest billing period end, so never let an event move it backwards — a
    // stale renewal, cancellation, or expiration would otherwise clobber newer
    // state (e.g. a late first-period EXPIRATION wiping an already-renewed sub).
    const incomingEnd = params.currentPeriodEnd?.getTime() ?? null;
    const existingEnd = existing.currentPeriodEnd?.getTime() ?? null;
    if (incomingEnd !== null && existingEnd !== null && incomingEnd < existingEnd) {
      return;
    }

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
