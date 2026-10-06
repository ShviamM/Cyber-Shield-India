import { Router, type IRouter } from "express";
import { count, desc } from "drizzle-orm";
import { db, launchWaitlistTable } from "@workspace/db";
import { hitRateLimit } from "../lib/rate-limit";
import { clientIp } from "../lib/client-ip";
import { HttpError } from "../lib/http-error";
import { parseWaitlistContact } from "../lib/waitlist-contact";
import { requirePermission } from "../middlewares/auth";
import { PERMISSIONS } from "../lib/rbac";

const router: IRouter = Router();

const WAITLIST_MAX_PER_IP_PER_HOUR = 10;

// Public: join the app-launch notification list from the website.
router.post("/waitlist", async (req, res) => {
  const { allowed } = await hitRateLimit(
    `waitlist:${clientIp(req)}`,
    WAITLIST_MAX_PER_IP_PER_HOUR,
    3_600_000,
  );
  if (!allowed) {
    throw new HttpError(429, "rate_limited", "Too many sign-ups from this device. Please try again later.");
  }

  const parsed = parseWaitlistContact(req.body?.contact);
  if (!parsed) {
    throw new HttpError(400, "invalid_contact", "Enter a valid email address or 10-digit Indian mobile number.");
  }
  const lang = req.body?.lang === "hi" ? "hi" : "en";

  await db
    .insert(launchWaitlistTable)
    .values({ ...parsed, lang, source: "website" })
    .onConflictDoNothing({ target: launchWaitlistTable.contact });

  // Same response for new and repeat sign-ups, so the endpoint can't be used to
  // check whether someone is already on the list.
  res.status(201).json({ ok: true });
});

// Admin: see who signed up.
router.get(
  "/admin/waitlist",
  requirePermission(PERMISSIONS.VIEW_BUSINESS_METRICS),
  async (_req, res) => {
    const [{ total }] = await db.select({ total: count() }).from(launchWaitlistTable);
    const entries = await db
      .select()
      .from(launchWaitlistTable)
      .orderBy(desc(launchWaitlistTable.createdAt))
      .limit(1000);
    res.json({ total, entries });
  },
);

export default router;
