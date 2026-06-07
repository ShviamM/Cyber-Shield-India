/**
 * Subscription plan catalogue — the single server-side source of truth for
 * pricing. The client renders localized names/features by plan key but must
 * never decide the price; the order amount is always taken from here.
 */

export type PlanKey = "free" | "premium" | "family";

export type BillingInterval = "month" | "year";

export interface PlanDef {
  key: PlanKey;
  /** Price per interval in the smallest currency unit (paise for INR). */
  amount: number;
  currency: "INR";
  interval: BillingInterval;
  /** Whether this plan unlocks premium-gated features. */
  premium: boolean;
}

export const PLANS: Record<PlanKey, PlanDef> = {
  free: {
    key: "free",
    amount: 0,
    currency: "INR",
    interval: "year",
    premium: false,
  },
  premium: {
    key: "premium",
    amount: 9900, // ₹99.00 / year
    currency: "INR",
    interval: "year",
    premium: true,
  },
  family: {
    key: "family",
    amount: 44900, // ₹449.00 / year
    currency: "INR",
    interval: "year",
    premium: true,
  },
};

/** Length of the no-card free trial granted on a paid plan, in days. */
export const TRIAL_DAYS = 7;

/**
 * Maximum protected family members allowed per plan. Server-enforced — only the
 * Family plan can keep members; free/premium owners get none.
 */
export const MAX_FAMILY_MEMBERS: Record<PlanKey, number> = {
  free: 0,
  premium: 0,
  family: 5,
};

export function maxFamilyMembers(plan: string): number {
  return isPlanKey(plan) ? MAX_FAMILY_MEMBERS[plan] : 0;
}

export const PLAN_KEYS = Object.keys(PLANS) as PlanKey[];

export function isPlanKey(value: string): value is PlanKey {
  return value === "free" || value === "premium" || value === "family";
}

export function getPlan(key: string): PlanDef | null {
  return isPlanKey(key) ? PLANS[key] : null;
}

/** Plans the user actually pays for (excludes free). */
export const PAID_PLAN_KEYS = PLAN_KEYS.filter((k) => PLANS[k].amount > 0);

/** Add one billing interval to a date (used to compute the next period end). */
export function addInterval(from: Date, interval: BillingInterval): Date {
  const next = new Date(from);
  if (interval === "year") {
    next.setFullYear(next.getFullYear() + 1);
  } else {
    next.setMonth(next.getMonth() + 1);
  }
  return next;
}

/**
 * The plan's contribution to monthly recurring revenue, in paise. Annual plans
 * are amortized over 12 months so MRR stays a true monthly figure.
 */
export function monthlyAmount(plan: PlanDef): number {
  return plan.interval === "year" ? Math.round(plan.amount / 12) : plan.amount;
}
