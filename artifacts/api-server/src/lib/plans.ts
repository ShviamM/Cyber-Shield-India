/**
 * Subscription plan catalogue — the single server-side source of truth for
 * pricing. The client renders localized names/features by plan key but must
 * never decide the price; the order amount is always taken from here.
 */

export type PlanKey = "free" | "premium" | "family";

export interface PlanDef {
  key: PlanKey;
  /** Price per interval in the smallest currency unit (paise for INR). */
  amount: number;
  currency: "INR";
  interval: "month";
  /** Whether this plan unlocks premium-gated features. */
  premium: boolean;
}

export const PLANS: Record<PlanKey, PlanDef> = {
  free: {
    key: "free",
    amount: 0,
    currency: "INR",
    interval: "month",
    premium: false,
  },
  premium: {
    key: "premium",
    amount: 1000, // ₹10.00
    currency: "INR",
    interval: "month",
    premium: true,
  },
  family: {
    key: "family",
    amount: 4900, // ₹49.00
    currency: "INR",
    interval: "month",
    premium: true,
  },
};

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
export function addInterval(from: Date, interval: "month"): Date {
  const next = new Date(from);
  if (interval === "month") {
    next.setMonth(next.getMonth() + 1);
  }
  return next;
}
