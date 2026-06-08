import { and, eq, sql } from "drizzle-orm";
import { db, dailyUsageTable } from "@workspace/db";
import { HttpError } from "./http-error";

export type UsageKind = "number_check" | "ai_check";

/** Free-tier daily allowances. Premium users are never metered. */
export const FREE_DAILY_LIMITS: Record<UsageKind, number> = {
  number_check: 10,
  ai_check: 5,
};

const LIMIT_MESSAGE: Record<UsageKind, string> = {
  number_check:
    "You've used all 10 free number checks for today. Upgrade to Premium for unlimited checks.",
  ai_check:
    "You've used all 5 free AI checks for today. Upgrade to Premium for unlimited AI analysis.",
};

export interface UsageResult {
  used: number;
  limit: number;
  remaining: number;
  allowed: boolean;
}

/** The current usage day in IST (Asia/Kolkata) as YYYY-MM-DD (en-CA renders so). */
export function usageDay(now: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

/**
 * Atomically increment the caller's usage for (subject, kind) on today's IST day
 * and report whether the action is still within the free cap. The upsert returns
 * the post-increment count, so two concurrent requests can never both slip past
 * the limit.
 */
export async function incrementDailyUsage(
  subject: string,
  kind: UsageKind,
): Promise<UsageResult> {
  const day = usageDay();
  const [row] = await db
    .insert(dailyUsageTable)
    .values({ subject, day, kind, count: 1 })
    .onConflictDoUpdate({
      target: [
        dailyUsageTable.subject,
        dailyUsageTable.day,
        dailyUsageTable.kind,
      ],
      set: {
        count: sql`${dailyUsageTable.count} + 1`,
        updatedAt: new Date(),
      },
    })
    .returning({ count: dailyUsageTable.count });

  const used = row?.count ?? 1;
  const limit = FREE_DAILY_LIMITS[kind];
  return {
    used,
    limit,
    remaining: Math.max(0, limit - used),
    allowed: used <= limit,
  };
}

/**
 * Increment the free-tier counter and throw a 402 when the cap is exceeded. Call
 * only for non-premium callers; premium users should skip metering entirely.
 */
export async function enforceDailyQuota(
  subject: string,
  kind: UsageKind,
): Promise<UsageResult> {
  const result = await incrementDailyUsage(subject, kind);
  if (!result.allowed) {
    throw new HttpError(402, "free_limit_reached", LIMIT_MESSAGE[kind]);
  }
  return result;
}

/** Read today's usage counts for a subject without incrementing. */
export async function getDailyUsage(
  subject: string,
): Promise<Record<UsageKind, number>> {
  const day = usageDay();
  const rows = await db
    .select({ kind: dailyUsageTable.kind, count: dailyUsageTable.count })
    .from(dailyUsageTable)
    .where(
      and(eq(dailyUsageTable.subject, subject), eq(dailyUsageTable.day, day)),
    );

  const out: Record<UsageKind, number> = { number_check: 0, ai_check: 0 };
  for (const r of rows) {
    if (r.kind === "number_check" || r.kind === "ai_check") {
      out[r.kind] = r.count;
    }
  }
  return out;
}
