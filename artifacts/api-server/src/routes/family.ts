import { Router, type IRouter } from "express";
import { and, asc, count, desc, eq, gt, inArray, isNull, ne } from "drizzle-orm";
import {
  db,
  deviceTokensTable,
  familyAlertsTable,
  familyMembersTable,
  numberReputationTable,
  usersTable,
  type FamilyAlert as DbFamilyAlert,
  type FamilyMember as DbFamilyMember,
} from "@workspace/db";
import {
  AcceptFamilyInviteParams,
  AddFamilyMemberBody,
  DeclineFamilyInviteParams,
  RemoveFamilyMemberParams,
  ReportFamilyCallBody,
  ResolveFamilyAlertParams,
  type FamilyAlert,
  type FamilyAlertList,
  type FamilyInvite,
  type FamilyInviteList,
  type FamilyMember,
  type FamilyMemberList,
  type FamilyCallResult,
  type SuccessResponse,
} from "@workspace/api-zod";
import { HttpError } from "../lib/http-error";
import { normalizeIndianPhone } from "../lib/phone";
import { requireAuth } from "../middlewares/auth";
import { getEffectiveSubscription } from "../lib/subscription";
import { maxFamilyMembers } from "../lib/plans";
import { computeRiskLevel, getCategoriesForNumber } from "../lib/reputation";
import { hitRateLimit } from "../lib/rate-limit";
import { sendExpoPush } from "../lib/expo-push";
import { buildFamilyAlertMessage, isAlertableRisk } from "../lib/family-alert-message";
import { logger } from "../lib/logger";

const router: IRouter = Router();

const DAY_MS = 24 * 60 * 60 * 1000;
// The same caller ringing the same member again within this window doesn't
// alert the guardian a second time.
const DEDUPE_MS = 30 * 60 * 1000;

type MemberStatus = FamilyMember["status"];

function memberStatus(row: DbFamilyMember): MemberStatus {
  return row.status === "accepted" || row.status === "declined" ? row.status : "pending";
}

function toAlertDto(alert: DbFamilyAlert, member: DbFamilyMember): FamilyAlert {
  return {
    id: alert.id,
    memberId: member.id,
    memberName: member.name,
    memberPhone: member.phone,
    callerPhone: alert.callerPhone,
    riskLevel: alert.riskLevel === "high" ? "high" : "medium",
    reportCount: alert.reportCount,
    category: alert.category,
    resolved: alert.resolvedAt !== null,
    createdAt: alert.createdAt,
  };
}

function toDto(row: DbFamilyMember, latestAlert: DbFamilyAlert | null = null): FamilyMember {
  return {
    id: row.id,
    name: row.name,
    phone: row.phone,
    relationship: row.relationship,
    createdAt: row.createdAt,
    status: memberStatus(row),
    latestAlert: latestAlert ? toAlertDto(latestAlert, row) : null,
  };
}

router.get("/family/members", requireAuth, async (req, res) => {
  const user = req.user!;
  const sub = await getEffectiveSubscription(user.id);

  const rows = await db
    .select()
    .from(familyMembersTable)
    .where(eq(familyMembersTable.ownerId, user.id))
    .orderBy(asc(familyMembersTable.createdAt));

  // Latest unresolved alert per member from the last 24 hours.
  const latest = new Map<string, DbFamilyAlert>();
  if (rows.length > 0) {
    const alerts = await db
      .select()
      .from(familyAlertsTable)
      .where(
        and(
          eq(familyAlertsTable.ownerId, user.id),
          isNull(familyAlertsTable.resolvedAt),
          gt(familyAlertsTable.createdAt, new Date(Date.now() - DAY_MS)),
        ),
      )
      .orderBy(desc(familyAlertsTable.createdAt));
    for (const a of alerts) if (!latest.has(a.memberId)) latest.set(a.memberId, a);
  }

  const response: FamilyMemberList = {
    members: rows.map((r) => toDto(r, latest.get(r.id) ?? null)),
    maxMembers: maxFamilyMembers(sub.plan),
    plan: sub.plan,
  };
  res.json(response);
});

router.post("/family/members", requireAuth, async (req, res) => {
  const user = req.user!;
  const body = AddFamilyMemberBody.parse(req.body);

  const sub = await getEffectiveSubscription(user.id);
  const cap = maxFamilyMembers(sub.plan);
  if (cap <= 0) {
    throw new HttpError(
      402,
      "family_plan_required",
      "Protecting family members requires an active Family plan.",
    );
  }

  const name = body.name.trim();
  if (!name) {
    throw new HttpError(400, "invalid_name", "Provide the member's name.");
  }
  const phone = normalizeIndianPhone(body.phone);
  if (!phone) {
    throw new HttpError(
      400,
      "invalid_phone",
      "Provide a valid Indian mobile number.",
    );
  }
  if (phone === user.phone) {
    throw new HttpError(
      400,
      "own_number",
      "Add a family member's number, not your own.",
    );
  }
  const relationship = body.relationship?.trim() || null;

  const [{ value: current }] = await db
    .select({ value: count() })
    .from(familyMembersTable)
    .where(eq(familyMembersTable.ownerId, user.id));
  if (Number(current) >= cap) {
    throw new HttpError(
      403,
      "family_limit_reached",
      `Your plan allows up to ${cap} protected members.`,
    );
  }

  const [existing] = await db
    .select()
    .from(familyMembersTable)
    .where(
      and(
        eq(familyMembersTable.ownerId, user.id),
        eq(familyMembersTable.phone, phone),
      ),
    )
    .limit(1);
  if (existing) {
    throw new HttpError(
      409,
      "duplicate_member",
      "This number is already in your family list.",
    );
  }

  const [created] = await db
    .insert(familyMembersTable)
    .values({ ownerId: user.id, name, phone, relationship })
    .returning();

  res.json(toDto(created));
});

router.delete("/family/members/:id", requireAuth, async (req, res) => {
  const user = req.user!;
  const { id } = RemoveFamilyMemberParams.parse(req.params);

  const [deleted] = await db
    .delete(familyMembersTable)
    .where(
      and(
        eq(familyMembersTable.id, id),
        eq(familyMembersTable.ownerId, user.id),
      ),
    )
    .returning();
  if (!deleted) {
    throw new HttpError(404, "not_found", "Family member not found.");
  }

  const response: SuccessResponse = { success: true };
  res.json(response);
});

// ── Member side: invites ────────────────────────────────────────────────────

async function loadInviteForMe(id: string, phone: string): Promise<DbFamilyMember> {
  const [row] = await db
    .select()
    .from(familyMembersTable)
    .where(and(eq(familyMembersTable.id, id), eq(familyMembersTable.phone, phone)))
    .limit(1);
  if (!row) throw new HttpError(404, "not_found", "Invite not found.");
  return row;
}

async function inviteDto(row: DbFamilyMember): Promise<FamilyInvite> {
  const [owner] = await db
    .select({ fullName: usersTable.fullName })
    .from(usersTable)
    .where(eq(usersTable.id, row.ownerId))
    .limit(1);
  return {
    id: row.id,
    ownerName: owner?.fullName ?? "",
    relationship: row.relationship,
    status: memberStatus(row),
    createdAt: row.createdAt,
  };
}

// Invites are matched on the phone number the member signed in with (OTP
// verified), so only the person who owns that number can accept.
router.get("/family/invites", requireAuth, async (req, res) => {
  const user = req.user!;
  const rows = await db
    .select({ member: familyMembersTable, ownerName: usersTable.fullName })
    .from(familyMembersTable)
    .innerJoin(usersTable, eq(usersTable.id, familyMembersTable.ownerId))
    .where(
      and(
        eq(familyMembersTable.phone, user.phone),
        ne(familyMembersTable.status, "declined"),
        ne(familyMembersTable.ownerId, user.id),
      ),
    )
    .orderBy(asc(familyMembersTable.createdAt));

  const response: FamilyInviteList = {
    invites: rows.map((r) => ({
      id: r.member.id,
      ownerName: r.ownerName,
      relationship: r.member.relationship,
      status: memberStatus(r.member),
      createdAt: r.member.createdAt,
    })),
  };
  res.json(response);
});

router.post("/family/invites/:id/accept", requireAuth, async (req, res) => {
  const user = req.user!;
  const { id } = AcceptFamilyInviteParams.parse(req.params);
  const row = await loadInviteForMe(id, user.phone);
  if (row.ownerId === user.id) {
    throw new HttpError(400, "own_invite", "You can't accept your own invite.");
  }
  const [updated] = await db
    .update(familyMembersTable)
    .set({ status: "accepted", memberUserId: user.id, respondedAt: new Date(), updatedAt: new Date() })
    .where(eq(familyMembersTable.id, row.id))
    .returning();
  res.json(await inviteDto(updated));
});

router.post("/family/invites/:id/decline", requireAuth, async (req, res) => {
  const user = req.user!;
  const { id } = DeclineFamilyInviteParams.parse(req.params);
  const row = await loadInviteForMe(id, user.phone);
  const [updated] = await db
    .update(familyMembersTable)
    .set({ status: "declined", memberUserId: null, respondedAt: new Date(), updatedAt: new Date() })
    .where(eq(familyMembersTable.id, row.id))
    .returning();
  res.json(await inviteDto(updated));
});

// ── Alerts ──────────────────────────────────────────────────────────────────

/**
 * The member's phone reports an incoming call. The server never trusts a
 * client-side verdict: it looks up the caller itself and only alerts on medium
 * or high community risk, and only guardians the member has accepted.
 */
router.post("/family/alerts", requireAuth, async (req, res) => {
  const user = req.user!;
  const body = ReportFamilyCallBody.parse(req.body);
  const none: FamilyCallResult = { notified: 0 };

  const callerPhone = normalizeIndianPhone(body.callerPhone);
  if (!callerPhone || callerPhone === user.phone) {
    res.json(none);
    return;
  }

  const limit = await hitRateLimit(`family-alert:${user.id}`, 20, 60 * 60 * 1000);
  if (!limit.allowed) {
    throw new HttpError(429, "rate_limited", "Too many calls reported. Try again later.");
  }

  const guardians = await db
    .select()
    .from(familyMembersTable)
    .where(
      and(
        eq(familyMembersTable.memberUserId, user.id),
        eq(familyMembersTable.status, "accepted"),
      ),
    );
  if (guardians.length === 0) {
    res.json(none);
    return;
  }

  const [rep] = await db
    .select()
    .from(numberReputationTable)
    .where(eq(numberReputationTable.phone, callerPhone))
    .limit(1);
  const reportCount = rep?.reportCount ?? 0;
  const riskLevel = computeRiskLevel({
    verifiedScam: rep?.verifiedScam ?? false,
    reportCount,
    lastReportedAt: rep?.lastReportedAt ?? null,
  });
  if (!isAlertableRisk(riskLevel)) {
    res.json(none);
    return;
  }
  const [topCategory] = await getCategoriesForNumber(callerPhone);
  const category = topCategory?.key ?? null;

  let notified = 0;
  for (const member of guardians) {
    // Family Guardian is a Family-plan feature of the owner's subscription.
    const sub = await getEffectiveSubscription(member.ownerId);
    if (maxFamilyMembers(sub.plan) <= 0) continue;

    const [recent] = await db
      .select({ id: familyAlertsTable.id })
      .from(familyAlertsTable)
      .where(
        and(
          eq(familyAlertsTable.memberId, member.id),
          eq(familyAlertsTable.callerPhone, callerPhone),
          gt(familyAlertsTable.createdAt, new Date(Date.now() - DEDUPE_MS)),
        ),
      )
      .limit(1);
    if (recent) continue;

    const [alert] = await db
      .insert(familyAlertsTable)
      .values({
        ownerId: member.ownerId,
        memberId: member.id,
        callerPhone,
        riskLevel,
        reportCount,
        category,
      })
      .returning();

    const tokens = (
      await db
        .select({ token: deviceTokensTable.token })
        .from(deviceTokensTable)
        .where(eq(deviceTokensTable.userId, member.ownerId))
    ).map((r) => r.token);
    if (tokens.length > 0) {
      const msg = buildFamilyAlertMessage({
        memberName: member.name,
        callerPhone,
        riskLevel,
        reportCount,
        category,
      });
      const { invalidTokens } = await sendExpoPush(tokens, msg.title, msg.body, {
        data: { type: "family_alert", alertId: alert.id, memberPhone: member.phone },
        priority: "high",
      });
      if (invalidTokens.length > 0) {
        await db.delete(deviceTokensTable).where(inArray(deviceTokensTable.token, invalidTokens));
      }
    }
    notified += 1;
  }

  if (notified > 0) {
    logger.info({ memberUserId: user.id, notified, riskLevel }, "Family Guardian alert sent");
  }
  const response: FamilyCallResult = { notified };
  res.json(response);
});

router.get("/family/alerts", requireAuth, async (req, res) => {
  const user = req.user!;
  const rows = await db
    .select({ alert: familyAlertsTable, member: familyMembersTable })
    .from(familyAlertsTable)
    .innerJoin(familyMembersTable, eq(familyMembersTable.id, familyAlertsTable.memberId))
    .where(eq(familyAlertsTable.ownerId, user.id))
    .orderBy(desc(familyAlertsTable.createdAt))
    .limit(50);
  const response: FamilyAlertList = {
    alerts: rows.map((r) => toAlertDto(r.alert, r.member)),
  };
  res.json(response);
});

router.post("/family/alerts/:id/resolve", requireAuth, async (req, res) => {
  const user = req.user!;
  const { id } = ResolveFamilyAlertParams.parse(req.params);
  const [updated] = await db
    .update(familyAlertsTable)
    .set({ resolvedAt: new Date() })
    .where(and(eq(familyAlertsTable.id, id), eq(familyAlertsTable.ownerId, user.id)))
    .returning();
  if (!updated) throw new HttpError(404, "not_found", "Alert not found.");
  const response: SuccessResponse = { success: true };
  res.json(response);
});

export default router;
