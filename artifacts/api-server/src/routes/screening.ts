import { Router, type IRouter } from "express";
import { desc, gte, or, eq } from "drizzle-orm";
import { db, numberReputationTable } from "@workspace/db";
import type { ScreeningBlocklist } from "@workspace/api-zod";
import { requireAuth } from "../middlewares/auth";

const router: IRouter = Router();

// Hard cap so the on-device sync stays small and fast. The highest-reported
// numbers come first, so the most dangerous entries are always included.
const MAX_BLOCKLIST = 5000;
// Mirrors the "medium+" risk threshold used by computeRiskLevel: a verified
// scam, or a number reported by at least this many people, is worth a warning.
const MIN_REPORTS = 2;

// Known high-risk numbers for on-device call/SMS screening. This is what powers
// "basic known-scam call screening" (a free feature) — without it the device can
// only warn about numbers the user personally checked. Match happens locally.
router.get("/screening/blocklist", requireAuth, async (_req, res) => {
  const rows = await db
    .select({ phone: numberReputationTable.phone })
    .from(numberReputationTable)
    .where(
      or(
        eq(numberReputationTable.verifiedScam, true),
        gte(numberReputationTable.reportCount, MIN_REPORTS),
      ),
    )
    .orderBy(desc(numberReputationTable.reportCount))
    .limit(MAX_BLOCKLIST);

  const response: ScreeningBlocklist = {
    phones: rows.map((r) => r.phone),
  };
  res.json(response);
});

export default router;
