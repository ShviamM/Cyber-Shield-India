import { pgTable, uuid, text, timestamp, index } from "drizzle-orm/pg-core";

/**
 * Messages sent through the public website contact form. status is "new" until
 * an admin marks it "handled" in the admin console.
 */
export const contactMessagesTable = pgTable(
  "contact_messages",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    email: text("email").notNull(),
    subject: text("subject").notNull(),
    message: text("message").notNull(),
    lang: text("lang").notNull().default("en"),
    status: text("status").notNull().default("new"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("contact_messages_status_idx").on(table.status),
    index("contact_messages_created_idx").on(table.createdAt),
  ],
);

export type ContactMessageRow = typeof contactMessagesTable.$inferSelect;
