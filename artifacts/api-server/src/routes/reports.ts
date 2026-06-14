import { Router, type IRouter } from "express";
import { and, count, desc, eq, gt, inArray } from "drizzle-orm";
import {
  db,
  fraudReportsTable,
  scamCategoriesTable,
  targetReportsTable,
  usersTable,
} from "@workspace/db";
import {
  CreatePublicReportBody,
  CreateReportBody,
  ListReportsQueryParams,
  type PublicReportResult,
  type Report,
  type ReportListResponse,
} from "@workspace/api-zod";
import { config } from "../config";
import { normalizeIndianPhone } from "../lib/phone";
import { normalizeUrlKey } from "../lib/url-analysis";
import { normalizeUpiKey } from "../lib/upi";
import { HttpError } from "../lib/http-error";
import { toReportDto } from "../lib/dto";
import { hitRateLimit } from "../lib/rate-limit";
import { recomputeReputation, recomputeTargetReputation } from "../lib/reputation";
import {
  issueChallenge,
  verifyProofOfWork,
  type BotCheckChallenge,
} from "../lib/proof-of-work";
import { requireAuth } from "../middlewares/auth";

const router: IRouter = Router();
const VISIBLE_STATUSES = ["pending", "verified"] as const;
const DEFAULT_PUBLIC_CATEGORY = "other";

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
    // leftJoin so anonymous web reports (null reporterId) still appear, with a
    // null reporter name.
    .leftJoin(usersTable, eq(fraudReportsTable.reporterId, usersTable.id))
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

/**
 * Issues a short-lived, server-signed proof-of-work challenge for the anonymous
 * report flow. The public website solves it and submits the solution with
 * POST /reports/public — a login-free bot check that hardens the endpoint
 * against automated spam without slowing an honest visitor down.
 */
router.get("/reports/public/challenge", async (_req, res) => {
  const challenge: BotCheckChallenge = issueChallenge();
  res.json(challenge);
});

/**
 * Anonymous fraud report from the public website scam checker. Unlike the
 * authenticated POST /reports, this has no user account, so abuse protection is
 * keyed by client IP (rate + duplicate) instead of by user id, and a
 * proof-of-work bot check (server-issued + server-verified) guards against
 * IP-rotating spam bots. Only phone numbers feed the phone reputation store;
 * url/upi reports feed a parallel target reputation store.
 */
router.post("/reports/public", async (req, res) => {
  const ip = req.ip ?? "unknown";

  // Per-IP hourly cap (cost/abuse guard).
  const { allowed } = await hitRateLimit(
    `report-web:${ip}`,
    config.reportMaxPerHour,
    3_600_000,
  );
  if (!allowed) {
    throw new HttpError(
      429,
      "rate_limited",
      "You have submitted too many reports recently. Please try again later.",
    );
  }

  const body = CreatePublicReportBody.parse(req.body);

  // Bot check: the client must submit a valid solution to a challenge we issued.
  const pow = verifyProofOfWork({
    challenge: body.powChallenge ?? undefined,
    expiresAt: body.powExpiresAt ?? undefined,
    difficulty: body.powDifficulty ?? undefined,
    signature: body.powSignature ?? undefined,
    solution: body.powSolution ?? undefined,
  });
  if (!pow.ok) {
    throw new HttpError(
      403,
      "bot_check_failed",
      "Could not verify you're human. Please try again.",
    );
  }
  // Replay guard: a solved challenge is single-use, so one proof can't be
  // reused to file many reports. Window matches the challenge lifetime.
  const fresh = await hitRateLimit(
    `pow-used:${pow.challenge}`,
    1,
    config.botCheckTtlMs,
  );
  if (!fresh.allowed) {
    throw new HttpError(
      403,
      "bot_check_failed",
      "Could not verify you're human. Please try again.",
    );
  }

  // Resolve the target: new clients send { type, value }; legacy phone clients
  // send { phone }. Default type is "phone".
  const targetType = body.type ?? "phone";
  const rawValue = body.value ?? body.phone ?? "";

  let value: string | null;
  if (targetType === "url") {
    value = normalizeUrlKey(rawValue);
    if (!value) {
      throw new HttpError(400, "invalid_target", "Enter a valid website link to report.");
    }
  } else if (targetType === "upi") {
    value = normalizeUpiKey(rawValue);
    if (!value) {
      throw new HttpError(400, "invalid_target", "Enter a valid UPI ID (name@bank) to report.");
    }
  } else {
    value = normalizeIndianPhone(rawValue);
    if (!value) {
      throw new HttpError(
        400,
        "invalid_phone",
        "Enter a valid 10-digit Indian mobile number to report",
      );
    }
  }

  // Resolve the category: default to "other" when the visitor doesn't pick one.
  const categoryKey = body.categoryKey?.trim() || DEFAULT_PUBLIC_CATEGORY;
  const [category] = await db
    .select({ key: scamCategoriesTable.key })
    .from(scamCategoriesTable)
    .where(eq(scamCategoriesTable.key, categoryKey))
    .limit(1);
  if (!category) {
    throw new HttpError(400, "invalid_category", "Unknown scam category.");
  }

  // Per-IP duplicate guard: one report per target per IP within the window.
  const dup = await hitRateLimit(
    `report-web-dup:${ip}:${targetType}:${value}`,
    1,
    config.reportDuplicateWindowHours * 3_600_000,
  );
  if (!dup.allowed) {
    throw new HttpError(
      409,
      "duplicate_report",
      "You have already reported this recently.",
    );
  }

  let reportCount: number;
  if (targetType === "phone") {
    await db.insert(fraudReportsTable).values({
      reporterId: null,
      phone: value,
      categoryKey: category.key,
      description: "Reported as a scam from the website scam checker.",
    });
    const reputation = await recomputeReputation(value);
    reportCount = reputation.reportCount;
  } else {
    await db.insert(targetReportsTable).values({
      reporterId: null,
      targetType,
      targetValue: value,
      categoryKey: category.key,
      description: "Reported as a scam from the website scam checker.",
    });
    const reputation = await recomputeTargetReputation(targetType, value);
    reportCount = reputation.reportCount;
  }

  const response: PublicReportResult = {
    type: targetType,
    value,
    reportCount,
  };
  res.json(response);
});

export default router;
