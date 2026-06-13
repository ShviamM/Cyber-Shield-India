import { Router, type IRouter } from "express";
import { and, count, desc, eq, ilike, inArray, or, sql } from "drizzle-orm";
import {
  db,
  adminAuditLogTable,
  deviceTokensTable,
  fraudReportsTable,
  rolesTable,
  sessionsTable,
  subscriptionsTable,
  usersTable,
} from "@workspace/db";
import {
  AdminUsersQueryParams,
  AdminExtendTrialBody,
  AdminActivateTrialBody,
  AdminResetTrialBody,
  AdminUpdateUserRoleBody,
  AdminUpdateUserStatusBody,
  type AdminUsersListResponse,
  type AdminUserDetail,
  type AdminTrialActionResponse,
  type AdminAuditLogListResponse,
  type RolesListResponse,
} from "@workspace/api-zod";
import { HttpError, isUuid } from "../lib/http-error";
import { requirePermission } from "../middlewares/auth";
import {
  PERMISSIONS,
  SUPPORT_MAX_EXTENSION_DAYS,
  userHasPermission,
  effectiveRoleName,
} from "../lib/rbac";
import { writeAudit } from "../lib/audit";
import {
  adminGrantTrial,
  adminResetTrial,
  getEffectiveSubscription,
  toSubscriptionStatusDto,
  TrialActionError,
  type AdminTrialResult,
} from "../lib/subscription";
import { type PlanKey } from "../lib/plans";
import { sendExpoPush } from "../lib/expo-push";
import { isSuperAdmin } from "../lib/super-admin";

const router: IRouter = Router();

const PAGE_SIZE_DEFAULT = 20;
const PAGE_SIZE_MAX = 100;

const TRIAL_PUSH_TITLE = "Netraksh trial extended";
const TRIAL_PUSH_BODY =
  "Your Netraksh trial has been extended. Enjoy premium protection.";

/** Best-effort push to every device a user has registered. */
async function pushToUser(
  userId: string,
  title: string,
  body: string,
): Promise<void> {
  const rows = await db
    .select({ token: deviceTokensTable.token })
    .from(deviceTokensTable)
    .where(eq(deviceTokensTable.userId, userId));
  const tokens = rows.map((r) => r.token);
  if (tokens.length === 0) return;
  const { invalidTokens } = await sendExpoPush(tokens, title, body);
  if (invalidTokens.length > 0) {
    await db
      .delete(deviceTokensTable)
      .where(inArray(deviceTokensTable.token, invalidTokens));
  }
}

function trialResponse(result: AdminTrialResult): AdminTrialActionResponse {
  return {
    subscription: toSubscriptionStatusDto(result.effective),
    previousStatus: result.previousStatus,
    previousEnd: result.previousEnd,
    newEnd: result.newEnd,
    plan: result.plan,
  };
}

function mapTrialError(err: unknown): never {
  if (err instanceof TrialActionError) {
    throw new HttpError(400, err.code, err.message);
  }
  throw err;
}

// ---------------------------------------------------------------------------
// Roles catalogue (for the role selector in the UI)
// ---------------------------------------------------------------------------

router.get(
  "/admin/roles",
  requirePermission(PERMISSIONS.VIEW_USERS),
  async (_req, res) => {
    const rows = await db
      .select()
      .from(rolesTable)
      .orderBy(desc(rolesTable.isSystem), rolesTable.name);
    const response: RolesListResponse = {
      roles: rows.map((r) => ({
        name: r.name,
        label: r.label,
        description: r.description,
        permissions: r.permissions ?? [],
        isSystem: r.isSystem,
      })),
    };
    res.json(response);
  },
);

// ---------------------------------------------------------------------------
// User listing with search / filter / pagination
// ---------------------------------------------------------------------------

router.get(
  "/admin/users",
  requirePermission(PERMISSIONS.VIEW_USERS),
  async (req, res) => {
    const q = AdminUsersQueryParams.parse(req.query);
    const page = q.page && q.page > 0 ? q.page : 1;
    const pageSize = Math.min(q.pageSize ?? PAGE_SIZE_DEFAULT, PAGE_SIZE_MAX);
    const offset = (page - 1) * pageSize;

    const filters = [];
    if (q.search) {
      const term = `%${q.search.trim()}%`;
      filters.push(
        or(ilike(usersTable.fullName, term), ilike(usersTable.phone, term)),
      );
    }
    if (q.role) filters.push(eq(usersTable.role, q.role));
    if (q.status) filters.push(eq(usersTable.status, q.status));
    const where = filters.length ? and(...filters) : undefined;

    const [[{ value: total }], rows] = await Promise.all([
      db.select({ value: count() }).from(usersTable).where(where),
      db
        .select({
          id: usersTable.id,
          fullName: usersTable.fullName,
          phone: usersTable.phone,
          location: usersTable.location,
          role: usersTable.role,
          isAdmin: usersTable.isAdmin,
          status: usersTable.status,
          createdAt: usersTable.createdAt,
          plan: subscriptionsTable.plan,
          subscriptionStatus: subscriptionsTable.status,
          currentPeriodEnd: subscriptionsTable.currentPeriodEnd,
          trialStartedAt: subscriptionsTable.trialStartedAt,
        })
        .from(usersTable)
        .leftJoin(
          subscriptionsTable,
          eq(subscriptionsTable.userId, usersTable.id),
        )
        .where(where)
        .orderBy(desc(usersTable.createdAt))
        .limit(pageSize)
        .offset(offset),
    ]);

    const userIds = rows.map((r) => r.id);
    const reportCounts = new Map<string, number>();
    const deviceCounts = new Map<string, number>();
    if (userIds.length > 0) {
      const [reportRows, deviceRows] = await Promise.all([
        db
          .select({
            userId: fraudReportsTable.reporterId,
            value: count(),
          })
          .from(fraudReportsTable)
          .where(inArray(fraudReportsTable.reporterId, userIds))
          .groupBy(fraudReportsTable.reporterId),
        db
          .select({
            userId: deviceTokensTable.userId,
            value: count(),
          })
          .from(deviceTokensTable)
          .where(inArray(deviceTokensTable.userId, userIds))
          .groupBy(deviceTokensTable.userId),
      ]);
      for (const r of reportRows)
        if (r.userId) reportCounts.set(r.userId, Number(r.value));
      for (const r of deviceRows) deviceCounts.set(r.userId, Number(r.value));
    }

    const response: AdminUsersListResponse = {
      users: rows.map((r) => ({
        id: r.id,
        fullName: r.fullName,
        phone: r.phone,
        location: r.location,
        role: r.role,
        isAdmin: r.isAdmin,
        status: r.status,
        plan: r.plan,
        subscriptionStatus: r.subscriptionStatus,
        currentPeriodEnd: r.currentPeriodEnd,
        trialStartedAt: r.trialStartedAt,
        deviceCount: deviceCounts.get(r.id) ?? 0,
        reportsFiled: reportCounts.get(r.id) ?? 0,
        createdAt: r.createdAt,
      })),
      total: Number(total),
      page,
      pageSize,
    };
    res.json(response);
  },
);

// ---------------------------------------------------------------------------
// User detail
// ---------------------------------------------------------------------------

router.get(
  "/admin/users/:id",
  requirePermission(PERMISSIONS.VIEW_USERS),
  async (req, res) => {
    const id = req.params.id as string;
    if (!isUuid(id)) throw new HttpError(400, "invalid_id", "Invalid user id");

    const [user] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, id))
      .limit(1);
    if (!user) throw new HttpError(404, "not_found", "User not found");

    const [[deviceRow], [reportRow], [lastSessionRow], effective] =
      await Promise.all([
        db
          .select({ value: count() })
          .from(deviceTokensTable)
          .where(eq(deviceTokensTable.userId, id)),
        db
          .select({ value: count() })
          .from(fraudReportsTable)
          .where(eq(fraudReportsTable.reporterId, id)),
        db
          .select({ createdAt: sessionsTable.createdAt })
          .from(sessionsTable)
          .where(eq(sessionsTable.userId, id))
          .orderBy(desc(sessionsTable.createdAt))
          .limit(1),
        getEffectiveSubscription(id),
      ]);

    const response: AdminUserDetail = {
      id: user.id,
      fullName: user.fullName,
      phone: user.phone,
      location: user.location,
      role: user.role,
      isAdmin: user.isAdmin,
      isSuperAdmin: isSuperAdmin(user),
      status: user.status,
      deviceCount: Number(deviceRow?.value ?? 0),
      reportsFiled: Number(reportRow?.value ?? 0),
      lastLoginAt: lastSessionRow?.createdAt ?? null,
      registeredAt: user.createdAt,
      subscription: toSubscriptionStatusDto(effective),
      trialStartedAt: effective.currentPeriodStart,
    };
    res.json(response);
  },
);

// ---------------------------------------------------------------------------
// Trial management
// ---------------------------------------------------------------------------

/** Load a target user or 404. */
async function loadTarget(id: string) {
  if (!isUuid(id)) throw new HttpError(400, "invalid_id", "Invalid user id");
  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, id))
    .limit(1);
  if (!user) throw new HttpError(404, "not_found", "User not found");
  return user;
}

router.post(
  "/admin/users/:id/trial/extend",
  requirePermission(PERMISSIONS.EXTEND_TRIAL_LIMITED),
  async (req, res) => {
    const id = req.params.id as string;
    const body = AdminExtendTrialBody.parse(req.body);
    const actor = req.user!;
    const target = await loadTarget(id);

    // Support agents (limited permission only) are capped; full managers aren't.
    const canManage = await userHasPermission(actor, PERMISSIONS.MANAGE_TRIALS);
    if (!canManage && body.days > SUPPORT_MAX_EXTENSION_DAYS) {
      throw new HttpError(
        403,
        "extension_too_long",
        `You can grant at most ${SUPPORT_MAX_EXTENSION_DAYS} days.`,
      );
    }

    const plan: PlanKey = body.plan ?? "premium";

    let result: AdminTrialResult;
    try {
      result = await adminGrantTrial({
        userId: id,
        plan,
        days: body.days,
        mode: "extend",
      });
    } catch (err) {
      mapTrialError(err);
    }

    await writeAudit({
      actor,
      action: "trial.extend",
      targetUserId: id,
      targetPhone: target.phone,
      reason: body.reason ?? null,
      metadata: {
        days: body.days,
        plan,
        previousStatus: result.previousStatus,
        previousEnd: result.previousEnd,
        newEnd: result.newEnd,
        note: body.note ?? null,
      },
      req,
    });

    await pushToUser(id, TRIAL_PUSH_TITLE, TRIAL_PUSH_BODY);
    res.json(trialResponse(result));
  },
);

router.post(
  "/admin/users/:id/trial/activate",
  requirePermission(PERMISSIONS.MANAGE_TRIALS),
  async (req, res) => {
    const id = req.params.id as string;
    const body = AdminActivateTrialBody.parse(req.body);
    const actor = req.user!;
    const target = await loadTarget(id);

    const plan: PlanKey = body.plan ?? "premium";

    let result: AdminTrialResult;
    try {
      result = await adminGrantTrial({
        userId: id,
        plan,
        days: body.days,
        mode: "activate",
      });
    } catch (err) {
      mapTrialError(err);
    }

    await writeAudit({
      actor,
      action: "trial.activate",
      targetUserId: id,
      targetPhone: target.phone,
      reason: body.reason ?? null,
      metadata: {
        days: body.days,
        plan,
        previousStatus: result.previousStatus,
        previousEnd: result.previousEnd,
        newEnd: result.newEnd,
        note: body.note ?? null,
      },
      req,
    });

    await pushToUser(id, TRIAL_PUSH_TITLE, TRIAL_PUSH_BODY);
    res.json(trialResponse(result));
  },
);

router.post(
  "/admin/users/:id/trial/reset",
  requirePermission(PERMISSIONS.MANAGE_TRIALS),
  async (req, res) => {
    const id = req.params.id as string;
    const body = AdminResetTrialBody.parse(req.body);
    const actor = req.user!;
    const target = await loadTarget(id);

    let result: { previousStatus: string; previousEnd: Date | null };
    let effective;
    try {
      const r = await adminResetTrial(id);
      result = { previousStatus: r.previousStatus, previousEnd: r.previousEnd };
      effective = r.effective;
    } catch (err) {
      mapTrialError(err);
    }

    await writeAudit({
      actor,
      action: "trial.reset",
      targetUserId: id,
      targetPhone: target.phone,
      reason: body.reason ?? null,
      metadata: {
        previousStatus: result.previousStatus,
        previousEnd: result.previousEnd,
        note: body.note ?? null,
      },
      req,
    });

    const response: AdminTrialActionResponse = {
      subscription: toSubscriptionStatusDto(effective),
      previousStatus: result.previousStatus,
      previousEnd: result.previousEnd,
      newEnd: null,
      plan: effective.plan,
    };
    res.json(response);
  },
);

// ---------------------------------------------------------------------------
// Role & status management (privileged)
// ---------------------------------------------------------------------------

router.patch(
  "/admin/users/:id/role",
  requirePermission(PERMISSIONS.MANAGE_ROLES),
  async (req, res) => {
    const id = req.params.id as string;
    const body = AdminUpdateUserRoleBody.parse(req.body);
    const actor = req.user!;
    const target = await loadTarget(id);

    // Privilege-escalation guards: only a platform owner may grant or revoke
    // super_admin, and nobody may change their own role.
    if (actor.id === target.id) {
      throw new HttpError(
        403,
        "self_modification",
        "You cannot change your own role.",
      );
    }
    const [role] = await db
      .select()
      .from(rolesTable)
      .where(eq(rolesTable.name, body.role))
      .limit(1);
    if (!role) throw new HttpError(400, "invalid_role", "Unknown role");

    const grantsSuperAdmin =
      body.role === "super_admin" || target.role === "super_admin";
    if (grantsSuperAdmin && !isSuperAdmin(actor)) {
      throw new HttpError(
        403,
        "forbidden",
        "Only a platform owner can change super admin access.",
      );
    }

    const isStaff = (role.permissions ?? []).length > 0;
    await db
      .update(usersTable)
      .set({
        role: body.role,
        // Keep the legacy isAdmin flag in sync so existing admin gates work.
        isAdmin: isStaff,
        updatedAt: new Date(),
      })
      .where(eq(usersTable.id, id));

    await writeAudit({
      actor,
      action: "role.update",
      targetUserId: id,
      targetPhone: target.phone,
      reason: body.reason ?? null,
      metadata: { from: target.role, to: body.role },
      req,
    });

    res.json({ id, role: body.role });
  },
);

router.patch(
  "/admin/users/:id/status",
  requirePermission(PERMISSIONS.MANAGE_ACCOUNT_STATUS),
  async (req, res) => {
    const id = req.params.id as string;
    const body = AdminUpdateUserStatusBody.parse(req.body);
    const actor = req.user!;
    const target = await loadTarget(id);

    if (actor.id === target.id) {
      throw new HttpError(
        403,
        "self_modification",
        "You cannot change your own status.",
      );
    }
    // Never let a non-owner suspend a platform owner.
    if (isSuperAdmin(target) && !isSuperAdmin(actor)) {
      throw new HttpError(
        403,
        "forbidden",
        "You cannot change a platform owner's status.",
      );
    }

    // Revoke active sessions when suspending/blocking so access ends at once.
    if (body.status === "suspended" || body.status === "blocked") {
      await db.delete(sessionsTable).where(eq(sessionsTable.userId, id));
    }

    await db
      .update(usersTable)
      .set({ status: body.status, updatedAt: new Date() })
      .where(eq(usersTable.id, id));

    await writeAudit({
      actor,
      action: "status.update",
      targetUserId: id,
      targetPhone: target.phone,
      reason: body.reason ?? null,
      metadata: { from: target.status, to: body.status },
      req,
    });

    res.json({ id, status: body.status });
  },
);

// ---------------------------------------------------------------------------
// Audit log
// ---------------------------------------------------------------------------

router.get(
  "/admin/users/:id/audit",
  requirePermission(PERMISSIONS.VIEW_AUDIT_LOG),
  async (req, res) => {
    const id = req.params.id as string;
    if (!isUuid(id)) throw new HttpError(400, "invalid_id", "Invalid user id");
    const rows = await db
      .select()
      .from(adminAuditLogTable)
      .where(eq(adminAuditLogTable.targetUserId, id))
      .orderBy(desc(adminAuditLogTable.createdAt))
      .limit(100);
    const response: AdminAuditLogListResponse = {
      entries: rows.map((r) => ({
        id: r.id,
        actorPhone: r.actorPhone,
        actorRole: r.actorRole,
        action: r.action,
        targetPhone: r.targetPhone,
        reason: r.reason,
        metadata: r.metadata ?? null,
        createdAt: r.createdAt,
      })),
    };
    res.json(response);
  },
);

router.get(
  "/admin/audit",
  requirePermission(PERMISSIONS.VIEW_AUDIT_LOG),
  async (_req, res) => {
    const rows = await db
      .select()
      .from(adminAuditLogTable)
      .orderBy(desc(adminAuditLogTable.createdAt))
      .limit(200);
    const response: AdminAuditLogListResponse = {
      entries: rows.map((r) => ({
        id: r.id,
        actorPhone: r.actorPhone,
        actorRole: r.actorRole,
        action: r.action,
        targetPhone: r.targetPhone,
        reason: r.reason,
        metadata: r.metadata ?? null,
        createdAt: r.createdAt,
      })),
    };
    res.json(response);
  },
);

export default router;
