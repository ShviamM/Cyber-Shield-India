import { Router, type IRouter } from "express";
import { and, count, desc, eq, gte, lte, inArray, sql } from "drizzle-orm";
import {
  db,
  broadcastsTable,
  deviceTokensTable,
  fraudReportsTable,
  numberReputationTable,
  paymentsTable,
  sessionsTable,
  subscriptionsTable,
  targetReportsTable,
  targetReputationTable,
  usersTable,
  type Broadcast as DbBroadcast,
} from "@workspace/db";
import {
  AdminListReportsQueryParams,
  AdminListTargetReportsQueryParams,
  AdminSendBroadcastBody,
  AdminUpdateReportBody,
  AdminUpdateReportParams,
  AdminUpdateTargetReportBody,
  AdminUpdateTargetReportParams,
  AdminVerifyNumberBody,
  AdminVerifyNumberParams,
  AdminVerifyTargetBody,
  type AdminReport,
  type AdminReportListResponse,
  type AdminTargetReport,
  type AdminTargetReportListResponse,
  type AdminStats,
  type Broadcast,
  type BroadcastList,
  type BusinessMetrics,
  type FraudMapResponse,
  type FraudMapState,
  type NumberReputation,
  type TargetReputation,
  type TrialListResponse as TrialList,
} from "@workspace/api-zod";
import { sendExpoPush } from "../lib/expo-push";
import { normalizeIndianPhone } from "../lib/phone";
import { HttpError, isUuid } from "../lib/http-error";
import { toAdminReportDto, toAdminTargetReportDto } from "../lib/dto";
import {
  recomputeReputation,
  recomputeTargetReputation,
  setVerifiedScam,
  setTargetVerifiedScam,
} from "../lib/reputation";
import { PLANS, monthlyAmount } from "../lib/plans";
import { isPremiumNowCondition } from "../lib/subscription";
import { resolveState } from "../lib/states";
import { requirePermission } from "../middlewares/auth";
import { PERMISSIONS } from "../lib/rbac";

const router: IRouter = Router();

const VISIBLE_REPORT_STATUSES = ["pending", "verified"] as const;

router.get("/admin/stats", requirePermission(PERMISSIONS.VIEW_DASHBOARD), async (_req, res) => {
  const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

  const [
    [{ value: totalUsers }],
    [{ value: premiumUsers }],
    [{ value: fraudReports }],
    [{ value: blockedNumbers }],
    [revenueRow],
    [dauRow],
  ] = await Promise.all([
    db.select({ value: count() }).from(usersTable),
    db
      .select({ value: count() })
      .from(subscriptionsTable)
      .where(
        and(
          eq(subscriptionsTable.status, "active"),
          inArray(subscriptionsTable.plan, ["premium", "family"]),
        ),
      ),
    db.select({ value: count() }).from(fraudReportsTable),
    db
      .select({ value: count() })
      .from(numberReputationTable)
      .where(eq(numberReputationTable.verifiedScam, true)),
    db
      .select({
        value: sql<string>`coalesce(sum(${paymentsTable.amount}), 0)`,
      })
      .from(paymentsTable)
      .where(eq(paymentsTable.status, "paid")),
    db
      .select({ value: sql<string>`count(distinct ${sessionsTable.userId})` })
      .from(sessionsTable)
      .where(gte(sessionsTable.createdAt, dayAgo)),
  ]);

  const response: AdminStats = {
    totalUsers,
    premiumUsers,
    fraudReports,
    blockedNumbers,
    revenuePaise: Number(revenueRow?.value ?? 0),
    dailyActiveUsers: Number(dauRow?.value ?? 0),
  };
  res.json(response);
});

router.get("/admin/reports", requirePermission(PERMISSIONS.MODERATE_REPORTS), async (req, res) => {
  const query = AdminListReportsQueryParams.parse(req.query);

  const conditions = [];
  if (query.status) {
    conditions.push(eq(fraudReportsTable.status, query.status));
  }
  if (query.phone) {
    const normalized = normalizeIndianPhone(query.phone);
    conditions.push(eq(fraudReportsTable.phone, normalized ?? "\u0000"));
  }
  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const limit = Math.min(Math.max(query.limit, 1), 200);
  const offset = Math.max(query.offset, 0);

  const rows = await db
    .select({
      report: fraudReportsTable,
      reporterName: usersTable.fullName,
      reporterPhone: usersTable.phone,
      verifiedScam: numberReputationTable.verifiedScam,
    })
    .from(fraudReportsTable)
    // leftJoin so anonymous web reports (null reporterId) still appear for
    // moderation, with null reporter name/phone.
    .leftJoin(usersTable, eq(fraudReportsTable.reporterId, usersTable.id))
    .leftJoin(
      numberReputationTable,
      eq(fraudReportsTable.phone, numberReputationTable.phone),
    )
    .where(where)
    .orderBy(desc(fraudReportsTable.createdAt))
    .limit(limit)
    .offset(offset);

  const [{ total }] = await db
    .select({ total: count() })
    .from(fraudReportsTable)
    .where(where);

  const response: AdminReportListResponse = {
    reports: rows.map((r) =>
      toAdminReportDto({
        report: r.report,
        reporterName: r.reporterName,
        reporterPhone: r.reporterPhone,
        verifiedScam: r.verifiedScam ?? false,
      }),
    ),
    total,
  };
  res.json(response);
});

router.patch("/admin/reports/:id", requirePermission(PERMISSIONS.MODERATE_REPORTS), async (req, res) => {
  const params = AdminUpdateReportParams.parse(req.params);
  const body = AdminUpdateReportBody.parse(req.body);

  if (!isUuid(params.id)) {
    throw new HttpError(404, "not_found", "Report not found");
  }

  const [existing] = await db
    .select({ id: fraudReportsTable.id })
    .from(fraudReportsTable)
    .where(eq(fraudReportsTable.id, params.id))
    .limit(1);
  if (!existing) {
    throw new HttpError(404, "not_found", "Report not found");
  }

  const [updated] = await db
    .update(fraudReportsTable)
    .set({ status: body.status, updatedAt: new Date() })
    .where(eq(fraudReportsTable.id, params.id))
    .returning();

  const reputation = await recomputeReputation(updated.phone);

  // Anonymous web reports have no reporter account.
  const [reporter] = updated.reporterId
    ? await db
        .select({ fullName: usersTable.fullName, phone: usersTable.phone })
        .from(usersTable)
        .where(eq(usersTable.id, updated.reporterId))
        .limit(1)
    : [];

  const response: AdminReport = toAdminReportDto({
    report: updated,
    reporterName: reporter?.fullName ?? null,
    reporterPhone: reporter?.phone ?? null,
    verifiedScam: reputation.verifiedScam,
  });
  res.json(response);
});

router.post("/admin/numbers/:phone/verify", requirePermission(PERMISSIONS.MANAGE_NUMBERS), async (req, res) => {
  const params = AdminVerifyNumberParams.parse(req.params);
  const body = AdminVerifyNumberBody.parse(req.body);

  const phone = normalizeIndianPhone(params.phone);
  if (!phone) {
    throw new HttpError(
      400,
      "invalid_phone",
      "Enter a valid 10-digit Indian mobile number",
    );
  }

  const row = await setVerifiedScam(phone, body.verifiedScam);
  const response: NumberReputation = {
    phone: row.phone,
    reportCount: row.reportCount,
    verifiedScam: row.verifiedScam,
    lastReportedAt: row.lastReportedAt,
  };
  res.json(response);
});

router.get("/admin/target-reports", requirePermission(PERMISSIONS.MODERATE_REPORTS), async (req, res) => {
  const query = AdminListTargetReportsQueryParams.parse(req.query);

  const conditions = [];
  if (query.status) {
    conditions.push(eq(targetReportsTable.status, query.status));
  }
  if (query.type) {
    conditions.push(eq(targetReportsTable.targetType, query.type));
  }
  if (query.search) {
    conditions.push(
      sql`${targetReportsTable.targetValue} ilike ${"%" + query.search + "%"}`,
    );
  }
  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const limit = Math.min(Math.max(query.limit, 1), 200);
  const offset = Math.max(query.offset, 0);

  const rows = await db
    .select({
      report: targetReportsTable,
      reporterName: usersTable.fullName,
      reporterPhone: usersTable.phone,
      verifiedScam: targetReputationTable.verifiedScam,
      reportCount: targetReputationTable.reportCount,
    })
    .from(targetReportsTable)
    // leftJoin so anonymous web reports (null reporterId) still appear for
    // moderation, with null reporter name/phone.
    .leftJoin(usersTable, eq(targetReportsTable.reporterId, usersTable.id))
    .leftJoin(
      targetReputationTable,
      and(
        eq(targetReportsTable.targetType, targetReputationTable.targetType),
        eq(targetReportsTable.targetValue, targetReputationTable.targetValue),
      ),
    )
    .where(where)
    .orderBy(desc(targetReportsTable.createdAt))
    .limit(limit)
    .offset(offset);

  const [{ total }] = await db
    .select({ total: count() })
    .from(targetReportsTable)
    .where(where);

  const response: AdminTargetReportListResponse = {
    reports: rows.map((r) =>
      toAdminTargetReportDto({
        report: r.report,
        reporterName: r.reporterName,
        reporterPhone: r.reporterPhone,
        verifiedScam: r.verifiedScam ?? false,
        reportCount: r.reportCount ?? 0,
      }),
    ),
    total,
  };
  res.json(response);
});

router.patch("/admin/target-reports/:id", requirePermission(PERMISSIONS.MODERATE_REPORTS), async (req, res) => {
  const params = AdminUpdateTargetReportParams.parse(req.params);
  const body = AdminUpdateTargetReportBody.parse(req.body);

  if (!isUuid(params.id)) {
    throw new HttpError(404, "not_found", "Report not found");
  }

  const [existing] = await db
    .select({ id: targetReportsTable.id })
    .from(targetReportsTable)
    .where(eq(targetReportsTable.id, params.id))
    .limit(1);
  if (!existing) {
    throw new HttpError(404, "not_found", "Report not found");
  }

  const [updated] = await db
    .update(targetReportsTable)
    .set({ status: body.status, updatedAt: new Date() })
    .where(eq(targetReportsTable.id, params.id))
    .returning();

  const reputation = await recomputeTargetReputation(
    updated.targetType,
    updated.targetValue,
  );

  // Anonymous web reports have no reporter account.
  const [reporter] = updated.reporterId
    ? await db
        .select({ fullName: usersTable.fullName, phone: usersTable.phone })
        .from(usersTable)
        .where(eq(usersTable.id, updated.reporterId))
        .limit(1)
    : [];

  const response: AdminTargetReport = toAdminTargetReportDto({
    report: updated,
    reporterName: reporter?.fullName ?? null,
    reporterPhone: reporter?.phone ?? null,
    verifiedScam: reputation.verifiedScam,
    reportCount: reputation.reportCount,
  });
  res.json(response);
});

router.post("/admin/targets/verify", requirePermission(PERMISSIONS.MANAGE_NUMBERS), async (req, res) => {
  const body = AdminVerifyTargetBody.parse(req.body);

  const row = await setTargetVerifiedScam(
    body.targetType,
    body.targetValue,
    body.verifiedScam,
  );
  const response: TargetReputation = {
    targetType: row.targetType as TargetReputation["targetType"],
    targetValue: row.targetValue,
    reportCount: row.reportCount,
    verifiedScam: row.verifiedScam,
    lastReportedAt: row.lastReportedAt,
  };
  res.json(response);
});

router.get("/admin/business-metrics", requirePermission(PERMISSIONS.VIEW_BUSINESS_METRICS), async (_req, res) => {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const in30Days = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  const ago30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const notExpired = and(
    sql`${subscriptionsTable.currentPeriodEnd} is not null`,
    gte(subscriptionsTable.currentPeriodEnd, now),
  );

  // Currently entitled paid members: a subscription keeps access until its
  // period end even after the user cancels (status "canceled"), so both count
  // toward active subscriptions / families protected.
  const entitledPaid = and(
    inArray(subscriptionsTable.plan, ["premium", "family"]),
    inArray(subscriptionsTable.status, ["active", "canceled"]),
    notExpired,
  );

  // Recurring members feed MRR: only active subscriptions that are not set to
  // cancel will actually bill again, so a canceled-at-period-end plan is not
  // recurring revenue.
  const recurringPaid = and(
    inArray(subscriptionsTable.plan, ["premium", "family"]),
    eq(subscriptionsTable.status, "active"),
    eq(subscriptionsTable.cancelAtPeriodEnd, false),
    notExpired,
  );

  const [
    [revenueAll],
    [revenueMonth],
    entitledByPlan,
    recurringByPlan,
    [renewalsRow],
    [newSubsRow],
    [trialsRow],
    [totalUsersRow],
  ] = await Promise.all([
    db
      .select({ value: sql<string>`coalesce(sum(${paymentsTable.amount}), 0)` })
      .from(paymentsTable)
      .where(eq(paymentsTable.status, "paid")),
    db
      .select({ value: sql<string>`coalesce(sum(${paymentsTable.amount}), 0)` })
      .from(paymentsTable)
      .where(
        and(
          eq(paymentsTable.status, "paid"),
          gte(paymentsTable.createdAt, monthStart),
        ),
      ),
    db
      .select({ plan: subscriptionsTable.plan, value: count() })
      .from(subscriptionsTable)
      .where(entitledPaid)
      .groupBy(subscriptionsTable.plan),
    db
      .select({ plan: subscriptionsTable.plan, value: count() })
      .from(subscriptionsTable)
      .where(recurringPaid)
      .groupBy(subscriptionsTable.plan),
    db
      .select({ value: count() })
      .from(subscriptionsTable)
      .where(
        and(
          recurringPaid,
          lte(subscriptionsTable.currentPeriodEnd, in30Days),
        ),
      ),
    db
      .select({ value: count() })
      .from(subscriptionsTable)
      .where(
        and(
          inArray(subscriptionsTable.plan, ["premium", "family"]),
          gte(subscriptionsTable.createdAt, ago30Days),
        ),
      ),
    db
      .select({ value: count() })
      .from(subscriptionsTable)
      .where(and(eq(subscriptionsTable.status, "trialing"), notExpired)),
    db.select({ value: count() }).from(usersTable),
  ]);

  const planCount = (
    rows: { plan: string; value: number }[],
    plan: string,
  ): number => Number(rows.find((r) => r.plan === plan)?.value ?? 0);

  const premiumSubscriptions = planCount(entitledByPlan, "premium");
  const familySubscriptions = planCount(entitledByPlan, "family");

  const response: BusinessMetrics = {
    revenuePaise: Number(revenueAll?.value ?? 0),
    revenueThisMonthPaise: Number(revenueMonth?.value ?? 0),
    mrrPaise:
      planCount(recurringByPlan, "premium") * monthlyAmount(PLANS.premium) +
      planCount(recurringByPlan, "family") * monthlyAmount(PLANS.family),
    activeSubscriptions: premiumSubscriptions + familySubscriptions,
    premiumSubscriptions,
    familySubscriptions,
    familiesProtected: familySubscriptions,
    renewalsDue: Number(renewalsRow?.value ?? 0),
    newSubscriptions: Number(newSubsRow?.value ?? 0),
    activeTrials: Number(trialsRow?.value ?? 0),
    totalUsers: Number(totalUsersRow?.value ?? 0),
  };
  res.json(response);
});

router.get("/admin/trials", requirePermission(PERMISSIONS.VIEW_BUSINESS_METRICS), async (_req, res) => {
  const now = new Date();

  const rows = await db
    .select({
      userId: subscriptionsTable.userId,
      fullName: usersTable.fullName,
      phone: usersTable.phone,
      plan: subscriptionsTable.plan,
      trialStartedAt: subscriptionsTable.trialStartedAt,
      currentPeriodEnd: subscriptionsTable.currentPeriodEnd,
      createdAt: subscriptionsTable.createdAt,
    })
    .from(subscriptionsTable)
    .innerJoin(usersTable, eq(subscriptionsTable.userId, usersTable.id))
    .where(
      and(
        eq(subscriptionsTable.status, "trialing"),
        sql`${subscriptionsTable.currentPeriodEnd} is not null`,
        gte(subscriptionsTable.currentPeriodEnd, now),
      ),
    )
    .orderBy(desc(subscriptionsTable.trialStartedAt));

  const response: TrialList = {
    trials: rows.map((r) => ({
      userId: r.userId,
      fullName: r.fullName,
      phone: r.phone,
      plan: r.plan,
      trialStartedAt: r.trialStartedAt,
      currentPeriodEnd: r.currentPeriodEnd,
      createdAt: r.createdAt,
    })),
    total: rows.length,
  };
  res.json(response);
});

router.get("/admin/fraud-map", requirePermission(PERMISSIONS.VIEW_FRAUD_MAP), async (_req, res) => {
  // Real user reports only — no seeded baseline.
  const liveRows = await db
    .select({ city: fraudReportsTable.city, value: count() })
    .from(fraudReportsTable)
    .where(
      and(
        inArray(fraudReportsTable.status, [...VISIBLE_REPORT_STATUSES]),
        sql`${fraudReportsTable.city} is not null`,
      ),
    )
    .groupBy(fraudReportsTable.city);

  const byState = new Map<string, FraudMapState>();
  const add = (city: string | null, amount: number) => {
    if (amount <= 0) return;
    const ref = resolveState(city);
    const existing = byState.get(ref.code);
    if (existing) {
      existing.reports += amount;
    } else {
      byState.set(ref.code, {
        state: ref.state,
        code: ref.code,
        reports: amount,
      });
    }
  };

  for (const row of liveRows) add(row.city, Number(row.value ?? 0));

  const states = [...byState.values()].sort((a, b) => b.reports - a.reports);
  const total = states.reduce((sum, s) => sum + s.reports, 0);

  const response: FraudMapResponse = { states, total };
  res.json(response);
});

function toBroadcastDto(row: DbBroadcast): Broadcast {
  return {
    id: row.id,
    title: row.title,
    body: row.body,
    recipientCount: row.recipientCount,
    successCount: row.successCount,
    createdAt: row.createdAt,
  };
}

router.get("/admin/broadcasts", requirePermission(PERMISSIONS.SEND_BROADCASTS), async (_req, res) => {
  const rows = await db
    .select()
    .from(broadcastsTable)
    .orderBy(desc(broadcastsTable.createdAt))
    .limit(100);
  const response: BroadcastList = { broadcasts: rows.map(toBroadcastDto) };
  res.json(response);
});

router.post("/admin/broadcasts", requirePermission(PERMISSIONS.SEND_BROADCASTS), async (req, res) => {
  const admin = req.user!;
  const body = AdminSendBroadcastBody.parse(req.body);
  const title = body.title.trim();
  const message = body.body.trim();
  if (!title || !message) {
    throw new HttpError(
      400,
      "invalid_broadcast",
      "Provide both a title and a message body.",
    );
  }

  // Priority alerts are a premium benefit: real-time push goes only to devices
  // of currently-premium users. Free users still see every broadcast in the
  // in-app feed (GET /notifications), which is their "in-app alerts only" tier.
  const tokenRows = await db
    .select({ token: deviceTokensTable.token })
    .from(deviceTokensTable)
    .innerJoin(
      subscriptionsTable,
      eq(subscriptionsTable.userId, deviceTokensTable.userId),
    )
    .where(isPremiumNowCondition());
  const tokens = tokenRows.map((r) => r.token);

  const { successCount, invalidTokens } = await sendExpoPush(
    tokens,
    title,
    message,
  );

  // Prune tokens Expo reported as no longer registered.
  if (invalidTokens.length > 0) {
    await db
      .delete(deviceTokensTable)
      .where(inArray(deviceTokensTable.token, invalidTokens));
  }

  const [created] = await db
    .insert(broadcastsTable)
    .values({
      title,
      body: message,
      sentById: admin.id,
      recipientCount: tokens.length,
      successCount,
    })
    .returning();

  res.json(toBroadcastDto(created));
});

export default router;
