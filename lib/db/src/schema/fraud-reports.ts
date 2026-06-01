import { pgTable, uuid, text, timestamp, index } from "drizzle-orm/pg-core";
import { usersTable } from "./users";

export const fraudReportsTable = pgTable(
  "fraud_reports",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    reporterId: uuid("reporter_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    phone: text("phone").notNull(),
    categoryKey: text("category_key").notNull(),
    description: text("description").notNull(),
    incidentDate: timestamp("incident_date", { withTimezone: true }),
    status: text("status").notNull().default("pending"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("fraud_reports_phone_idx").on(table.phone),
    index("fraud_reports_reporter_idx").on(table.reporterId),
    index("fraud_reports_status_idx").on(table.status),
  ],
);

export type FraudReport = typeof fraudReportsTable.$inferSelect;
export type InsertFraudReport = typeof fraudReportsTable.$inferInsert;
