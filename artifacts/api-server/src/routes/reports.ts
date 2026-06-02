import { Router, type IRouter } from "express";
import { and, count, desc, eq, gt, inArray } from "drizzle-orm";
import { db, fraudReportsTable, scamCategoriesTable, usersTable } from "@workspace/db";
import {
  CreateReportBody,
  ListReportsQueryParams,
  type Report,
  type ReportListResponse,
} from "@workspace/api-zod";
import { config } from "../config";
import { normalizeIndianPhone } from "../lib/phone";
import { HttpError } from "../lib/http-error";
import { toReportDto } from "../lib/dto";
import { recomputeReputation } from "../lib/reputation";
import { requireAuth } from "../middlewares/auth";

const router: IRouter = Router();
const VISIBLE_STATUSES = ["pending", "verified"] as const;

router.post("/reports", requireAuth, async (req, res) => {
  const user = req.user!;
  const body = CreateReportBody.parse(req.body);

  const phone = normalizeIndianPhone(body.phone);
  if (!phone) {
    throw new HttpError(
      400,
      "invalid_phone",
      "Enter a valid 10-digit Indian mobile number to report",
    );
  }

  const categoryKey = body.categoryKey.trim();
  const [category] = await db
    .select({ key: scamCategoriesTable.key })
    .from(scamCategoriesTable)
    .where(eq(scamCategoriesTable.key, categoryKey))
    .limit(1);
  if (!category) {
    throw new HttpError(400, "invalid_category", "Unknown scam category.");
  }

  const description = body.description.trim();
  if (description.length < 5) {
    throw new HttpError(
      400,
      "invalid_description",
      "Please describe the incident (at least 5 characters).",
    );
  }
  if (description.length > 2000) {
    throw new HttpError(
      400,
      "invalid_description",
      "Description is too long (max 2000 characters).",
    );
  }

  const dupWindow = new Date(
    Date.now() - config.reportDuplicateWindowHours * 3_600_000,
  );
  const [dup] = await db
    .select({ id: fraudReportsTable.id })
    .from(fraudReportsTable)
    .where(
      and(
        eq(fraudReportsTable.reporterId, user.id),
        eq(fraudReportsTable.phone, phone),
        gt(fraudReportsTable.createdAt, dupWindow),
      ),
    )
    .limit(1);
  if (dup) {
    throw new HttpError(
      409,
      "duplicate_report",
      "You have already reported this number recently.",
    );
  }

  const hourAgo = new Date(Date.now() - 3_600_000);
  const [{ recentCount }] = await db
    .select({ recentCount: count() })
    .from(fraudReportsTable)
    .where(
      and(
        eq(fraudReportsTable.reporterId, user.id),
        gt(fraudReportsTable.createdAt, hourAgo),
      ),
    );
  if (recentCount >= config.reportMaxPerHour) {
    throw new HttpError(
      429,
      "rate_limited",
      "You have submitted too many reports recently. Please try again later.",
    );
  }

  const [report] = await db
    .insert(fraudReportsTable)
    .values({
      reporterId: user.id,
      phone,
      categoryKey,
      description,
      city: body.city?.trim() || null,
      incidentDate: body.incidentDate ?? null,
    })
    .returning();

  await recomputeReputation(phone);

  const response: Report = toReportDto(report, user.fullName);
  res.json(response);
});

router.get("/reports", async (req, res) => {
  const query = ListReportsQueryParams.parse(req.query);

  const conditions = [inArray(fraudReportsTable.status, [...VISIBLE_STATUSES])];
  if (query.phone) {
    const normalized = normalizeIndianPhone(query.phone);
    // When the search term isn't a valid number, force an empty result set.
    conditions.push(eq(fraudReportsTable.phone, normalized ?? "\u0000"));
  }
  if (query.category) {
    conditions.push(eq(fraudReportsTable.categoryKey, query.category));
  }
  const where = and(...conditions);

  const limit = Math.min(Math.max(query.limit, 1), 100);
  const offset = Math.max(query.offset, 0);

  const rows = await db
    .select({ report: fraudReportsTable, reporterName: usersTable.fullName })
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

  const response: ReportListResponse = {
    reports: rows.map((r) => toReportDto(r.report, r.reporterName)),
    total,
  };
  res.json(response);
});

export default router;
