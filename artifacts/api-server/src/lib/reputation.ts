import {
  db,
  fraudReportsTable,
  numberReputationTable,
  type NumberReputation,
} from "@workspace/db";
import { and, eq, inArray, sql } from "drizzle-orm";
import type { NumberCheckResponseRiskLevel } from "@workspace/api-zod";

const VISIBLE_STATUSES = ["pending", "verified"] as const;
const NINETY_DAYS_MS = 90 * 24 * 60 * 60 * 1000;

export function computeRiskLevel(opts: {
  verifiedScam: boolean;
  reportCount: number;
  lastReportedAt: Date | null;
}): NumberCheckResponseRiskLevel {
  const { verifiedScam, reportCount, lastReportedAt } = opts;
  if (verifiedScam) return "high";
  if (reportCount <= 0) return "unknown";

  const recent = lastReportedAt
    ? Date.now() - lastReportedAt.getTime() < NINETY_DAYS_MS
    : false;

  if (reportCount >= 5 || (reportCount >= 3 && recent)) return "high";
  if (reportCount >= 2 || recent) return "medium";
  return "low";
}

/**
 * Recompute the cached report count and last-reported timestamp for a number
 * from its currently-visible reports (pending/verified), preserving the
 * admin-controlled verifiedScam flag. Called after any report create/moderation.
 */
export async function recomputeReputation(phone: string): Promise<NumberReputation> {
  const [agg] = await db
    .select({
      count: sql<number>`count(*)::int`,
      last: sql<string | null>`max(${fraudReportsTable.createdAt})`,
    })
    .from(fraudReportsTable)
    .where(
      and(
        eq(fraudReportsTable.phone, phone),
        inArray(fraudReportsTable.status, [...VISIBLE_STATUSES]),
      ),
    );

  const reportCount = agg?.count ?? 0;
  // A raw max() expression has no column type mapping, so the driver may return
  // the timestamp as a string — coerce to Date before writing it back.
  const lastReportedAt = agg?.last ? new Date(agg.last) : null;

  const [row] = await db
    .insert(numberReputationTable)
    .values({ phone, reportCount, lastReportedAt })
    .onConflictDoUpdate({
      target: numberReputationTable.phone,
      set: { reportCount, lastReportedAt, updatedAt: new Date() },
    })
    .returning();

  return row;
}

export async function setVerifiedScam(
  phone: string,
  verifiedScam: boolean,
): Promise<NumberReputation> {
  await recomputeReputation(phone);
  const [row] = await db
    .update(numberReputationTable)
    .set({ verifiedScam, updatedAt: new Date() })
    .where(eq(numberReputationTable.phone, phone))
    .returning();
  return row;
}

export async function getCategoriesForNumber(
  phone: string,
): Promise<{ key: string; count: number }[]> {
  const rows = await db
    .select({
      key: fraudReportsTable.categoryKey,
      count: sql<number>`count(*)::int`,
    })
    .from(fraudReportsTable)
    .where(
      and(
        eq(fraudReportsTable.phone, phone),
        inArray(fraudReportsTable.status, [...VISIBLE_STATUSES]),
      ),
    )
    .groupBy(fraudReportsTable.categoryKey)
    .orderBy(sql`count(*) desc`);
  return rows.map((r) => ({ key: r.key, count: r.count ?? 0 }));
}
