import { Router, type IRouter } from "express";
import { and, count, desc, eq } from "drizzle-orm";
import { db, fraudReportsTable, usersTable } from "@workspace/db";
import {
  AdminListReportsQueryParams,
  AdminUpdateReportBody,
  AdminUpdateReportParams,
  AdminVerifyNumberBody,
  AdminVerifyNumberParams,
  type AdminReport,
  type AdminReportListResponse,
  type NumberReputation,
} from "@workspace/api-zod";
import { normalizeIndianPhone } from "../lib/phone";
import { HttpError, isUuid } from "../lib/http-error";
import { toAdminReportDto } from "../lib/dto";
import { recomputeReputation, setVerifiedScam } from "../lib/reputation";
import { requireAdmin } from "../middlewares/auth";

const router: IRouter = Router();

router.get("/admin/reports", requireAdmin, async (req, res) => {
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
    })
    .from(fraudReportsTable)
    .innerJoin(usersTable, eq(fraudReportsTable.reporterId, usersTable.id))
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
      }),
    ),
    total,
  };
  res.json(response);
});

router.patch("/admin/reports/:id", requireAdmin, async (req, res) => {
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

  await recomputeReputation(updated.phone);

  const [reporter] = await db
    .select({ fullName: usersTable.fullName, phone: usersTable.phone })
    .from(usersTable)
    .where(eq(usersTable.id, updated.reporterId))
    .limit(1);

  const response: AdminReport = toAdminReportDto({
    report: updated,
    reporterName: reporter?.fullName ?? null,
    reporterPhone: reporter?.phone ?? null,
  });
  res.json(response);
});

router.post("/admin/numbers/:phone/verify", requireAdmin, async (req, res) => {
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

export default router;
