import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, numberReputationTable } from "@workspace/db";
import { CheckNumberParams, type NumberCheckResponse } from "@workspace/api-zod";
import { normalizeIndianPhone } from "../lib/phone";
import { HttpError } from "../lib/http-error";
import { computeRiskLevel, getCategoriesForNumber } from "../lib/reputation";

const router: IRouter = Router();

router.get("/numbers/:phone/check", async (req, res) => {
  const params = CheckNumberParams.parse(req.params);
  const phone = normalizeIndianPhone(params.phone);
  if (!phone) {
    throw new HttpError(
      400,
      "invalid_phone",
      "Enter a valid 10-digit Indian mobile number",
    );
  }

  const [rep] = await db
    .select()
    .from(numberReputationTable)
    .where(eq(numberReputationTable.phone, phone))
    .limit(1);

  const reportCount = rep?.reportCount ?? 0;
  const lastReportedAt = rep?.lastReportedAt ?? null;
  const verifiedScam = rep?.verifiedScam ?? false;

  const categories =
    reportCount > 0 || verifiedScam ? await getCategoriesForNumber(phone) : [];

  const response: NumberCheckResponse = {
    phone,
    riskLevel: computeRiskLevel({ verifiedScam, reportCount, lastReportedAt }),
    reportCount,
    verifiedScam,
    lastReportedAt,
    categories,
  };
  res.json(response);
});

export default router;
