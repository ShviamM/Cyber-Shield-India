import { Router, type IRouter } from "express";
import { and, asc, count, eq } from "drizzle-orm";
import { db, familyMembersTable, type FamilyMember as DbFamilyMember } from "@workspace/db";
import {
  AddFamilyMemberBody,
  RemoveFamilyMemberParams,
  type FamilyMember,
  type FamilyMemberList,
  type SuccessResponse,
} from "@workspace/api-zod";
import { HttpError } from "../lib/http-error";
import { normalizeIndianPhone } from "../lib/phone";
import { requireAuth } from "../middlewares/auth";
import { getEffectiveSubscription } from "../lib/subscription";
import { maxFamilyMembers } from "../lib/plans";

const router: IRouter = Router();

function toDto(row: DbFamilyMember): FamilyMember {
  return {
    id: row.id,
    name: row.name,
    phone: row.phone,
    relationship: row.relationship,
    createdAt: row.createdAt,
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

  const response: FamilyMemberList = {
    members: rows.map(toDto),
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

export default router;
