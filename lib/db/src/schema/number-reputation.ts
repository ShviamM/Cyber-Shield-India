import { pgTable, text, integer, boolean, timestamp } from "drizzle-orm/pg-core";

export const numberReputationTable = pgTable("number_reputation", {
  phone: text("phone").primaryKey(),
  reportCount: integer("report_count").notNull().default(0),
  verifiedScam: boolean("verified_scam").notNull().default(false),
  lastReportedAt: timestamp("last_reported_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type NumberReputation = typeof numberReputationTable.$inferSelect;
export type InsertNumberReputation = typeof numberReputationTable.$inferInsert;
