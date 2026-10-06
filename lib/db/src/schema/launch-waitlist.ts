import { pgTable, uuid, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core";

/**
 * People who asked to be told when the Netraksh app launches, collected from
 * the public website. `contact` is either a lower-cased email or an E.164 Indian
 * mobile number; it is unique so repeat sign-ups are no-ops.
 */
export const launchWaitlistTable = pgTable(
  "launch_waitlist",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    contact: text("contact").notNull(),
    contactType: text("contact_type").notNull(),
    lang: text("lang").notNull().default("en"),
    source: text("source").notNull().default("website"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [uniqueIndex("launch_waitlist_contact_idx").on(table.contact)],
);

export type LaunchWaitlistEntry = typeof launchWaitlistTable.$inferSelect;
