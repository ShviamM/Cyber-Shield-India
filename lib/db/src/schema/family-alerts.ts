import { pgTable, uuid, text, integer, timestamp, index } from "drizzle-orm/pg-core";
import { usersTable } from "./users";
import { familyMembersTable } from "./family-members";

/**
 * Family Guardian alerts: a protected family member received a call from a
 * number the community has reported as a scam, and the owner was notified.
 */
export const familyAlertsTable = pgTable(
  "family_alerts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    ownerId: uuid("owner_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    memberId: uuid("member_id")
      .notNull()
      .references(() => familyMembersTable.id, { onDelete: "cascade" }),
    // Normalized number that called the family member.
    callerPhone: text("caller_phone").notNull(),
    // Server-computed risk at alert time: "high" | "medium".
    riskLevel: text("risk_level").notNull(),
    reportCount: integer("report_count").notNull().default(0),
    // Top reported scam category key, if any.
    category: text("category"),
    // Set when the owner marks the member safe.
    resolvedAt: timestamp("resolved_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("family_alerts_owner_created_idx").on(table.ownerId, table.createdAt),
    index("family_alerts_member_idx").on(table.memberId),
  ],
);

export type FamilyAlert = typeof familyAlertsTable.$inferSelect;
