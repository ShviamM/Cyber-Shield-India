import {
  pgTable,
  uuid,
  text,
  boolean,
  timestamp,
  uniqueIndex,
  index,
} from "drizzle-orm/pg-core";
import { usersTable } from "./users";

/**
 * One row per user describing their current subscription state. A user without
 * a row is treated as the free plan. The server is the source of truth for the
 * active plan and period — never the client.
 */
export const subscriptionsTable = pgTable(
  "subscriptions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    // "free" | "premium" | "family"
    plan: text("plan").notNull().default("free"),
    // "active" | "canceled" | "expired" | "past_due"
    status: text("status").notNull().default("active"),
    currentPeriodStart: timestamp("current_period_start", {
      withTimezone: true,
    }),
    // Null means the plan does not expire (e.g. free).
    currentPeriodEnd: timestamp("current_period_end", { withTimezone: true }),
    // When true the paid plan will not renew and lapses to free at period end.
    cancelAtPeriodEnd: boolean("cancel_at_period_end").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("subscriptions_user_idx").on(table.userId),
    index("subscriptions_status_idx").on(table.status),
    index("subscriptions_period_end_idx").on(table.currentPeriodEnd),
  ],
);

export type Subscription = typeof subscriptionsTable.$inferSelect;
export type InsertSubscription = typeof subscriptionsTable.$inferInsert;
