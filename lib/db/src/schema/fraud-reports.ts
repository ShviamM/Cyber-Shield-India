import { pgTable, uuid, text, timestamp, index } from "drizzle-orm/pg-core";
import { usersTable } from "./users";

export const fraudReportsTable = pgTable(
  "fraud_reports",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    // Nullable: anonymous reports submitted from the public website scam
    // checker have no user account. Authenticated (mobile) reports still set it.
    reporterId: uuid("reporter_id").references(() => usersTable.id, {
      onDelete: "cascade",
    }),
    phone: text("phone").notNull(),
    categoryKey: text("category_key").notNull(),
    description: text("description").notNull(),
    city: text("city"),
    incidentDate: timestamp("incident_date", { withTimezone: true }),
    status: text("status").notNull().default("pending"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("fraud_reports_phone_idx").on(table.phone),
    index("fraud_reports_reporter_idx").on(table.reporterId),
    index("fraud_reports_status_idx").on(table.status),
    index("fraud_reports_city_idx").on(table.city),
    index("fraud_reports_created_idx").on(table.createdAt),
  ],
);

export type FraudReport = typeof fraudReportsTable.$inferSelect;
export type InsertFraudReport = typeof fraudReportsTable.$inferInsert;
