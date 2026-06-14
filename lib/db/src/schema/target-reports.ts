import {
  pgTable,
  uuid,
  text,
  integer,
  boolean,
  timestamp,
  index,
  primaryKey,
} from "drizzle-orm/pg-core";
import { usersTable } from "./users";

/**
 * Community fraud reports for non-phone targets — website links (url) and UPI
 * IDs (upi). Mirrors fraud_reports (which is phone-keyed) but keyed by a
 * (targetType, targetValue) pair so the same store can hold both. targetValue is
 * the normalized key produced by the engine's url/upi normalizers, so report and
 * check lookups agree.
 */
export const targetReportsTable = pgTable(
  "target_reports",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    // Nullable: anonymous reports from the public website scam checker have no
    // user account. Authenticated reports (if added later) set it.
    reporterId: uuid("reporter_id").references(() => usersTable.id, {
      onDelete: "cascade",
    }),
    targetType: text("target_type").notNull(),
    targetValue: text("target_value").notNull(),
    categoryKey: text("category_key").notNull(),
    description: text("description").notNull(),
    status: text("status").notNull().default("pending"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("target_reports_target_idx").on(table.targetType, table.targetValue),
    index("target_reports_reporter_idx").on(table.reporterId),
    index("target_reports_status_idx").on(table.status),
    index("target_reports_created_idx").on(table.createdAt),
  ],
);

export type TargetReport = typeof targetReportsTable.$inferSelect;
export type InsertTargetReport = typeof targetReportsTable.$inferInsert;

/**
 * Cached community reputation for url/upi targets, recomputed from
 * target_reports. Mirrors number_reputation. Composite primary key on
 * (targetType, targetValue).
 */
export const targetReputationTable = pgTable(
  "target_reputation",
  {
    targetType: text("target_type").notNull(),
    targetValue: text("target_value").notNull(),
    reportCount: integer("report_count").notNull().default(0),
    verifiedScam: boolean("verified_scam").notNull().default(false),
    lastReportedAt: timestamp("last_reported_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    primaryKey({ columns: [table.targetType, table.targetValue] }),
  ],
);

export type TargetReputation = typeof targetReputationTable.$inferSelect;
export type InsertTargetReputation = typeof targetReputationTable.$inferInsert;
