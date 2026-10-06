import { Router, type IRouter } from "express";
import { count, desc, eq } from "drizzle-orm";
import { db, contactMessagesTable, type ContactMessageRow } from "@workspace/db";
import { SubmitContactMessageBody, AdminUpdateContactMessageBody } from "@workspace/api-zod";
import { hitRateLimit } from "../lib/rate-limit";
import { clientIp } from "../lib/client-ip";
import { HttpError, isUuid } from "../lib/http-error";
import { requirePermission } from "../middlewares/auth";
import { PERMISSIONS } from "../lib/rbac";

const router: IRouter = Router();

const CONTACT_MAX_PER_IP_PER_HOUR = 5;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function toDto(row: ContactMessageRow) {
  return { ...row, createdAt: row.createdAt.toISOString() };
}

// Public: website contact form.
router.post("/contact", async (req, res) => {
  const { allowed } = await hitRateLimit(
    `contact:${clientIp(req)}`,
    CONTACT_MAX_PER_IP_PER_HOUR,
    3_600_000,
  );
  if (!allowed) {
    throw new HttpError(429, "rate_limited", "Too many messages from this device. Please try again later.");
  }

  const body = SubmitContactMessageBody.parse(req.body);
  const email = body.email.trim().toLowerCase();
  if (!EMAIL_RE.test(email)) {
    throw new HttpError(400, "invalid_email", "Enter a valid email address.");
  }

  await db.insert(contactMessagesTable).values({
    name: body.name.trim(),
    email,
    subject: body.subject,
    message: body.message.trim(),
    lang: body.lang === "hi" ? "hi" : "en",
  });

  res.status(201).json({ success: true });
});

// Admin: read and triage contact messages.
router.get(
  "/admin/contact-messages",
  requirePermission(PERMISSIONS.VIEW_BUSINESS_METRICS),
  async (req, res) => {
    const status = req.query.status === "new" || req.query.status === "handled" ? req.query.status : undefined;
    const [{ total }] = await db.select({ total: count() }).from(contactMessagesTable);
    const [{ newCount }] = await db
      .select({ newCount: count() })
      .from(contactMessagesTable)
      .where(eq(contactMessagesTable.status, "new"));
    const rows = await db
      .select()
      .from(contactMessagesTable)
      .where(status ? eq(contactMessagesTable.status, status) : undefined)
      .orderBy(desc(contactMessagesTable.createdAt))
      .limit(500);
    res.json({ total, newCount, messages: rows.map(toDto) });
  },
);

router.patch(
  "/admin/contact-messages/:id",
  requirePermission(PERMISSIONS.VIEW_BUSINESS_METRICS),
  async (req, res) => {
    const id = String(req.params.id);
    if (!isUuid(id)) throw new HttpError(404, "not_found", "Message not found.");
    const { status } = AdminUpdateContactMessageBody.parse(req.body);
    const [row] = await db
      .update(contactMessagesTable)
      .set({ status })
      .where(eq(contactMessagesTable.id, id))
      .returning();
    if (!row) throw new HttpError(404, "not_found", "Message not found.");
    res.json(toDto(row));
  },
);

export default router;
