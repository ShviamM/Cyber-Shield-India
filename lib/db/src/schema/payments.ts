import {
  pgTable,
  uuid,
  text,
  integer,
  timestamp,
  uniqueIndex,
  index,
} from "drizzle-orm/pg-core";
import { usersTable } from "./users";
import { subscriptionsTable } from "./subscriptions";

/**
 * Immutable transaction history. One row per Razorpay order. The row starts in
 * "created" when the order is opened and transitions to "paid" or "failed" only
 * after server-side signature verification or a verified webhook event.
 */
export const paymentsTable = pgTable(
  "payments",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    subscriptionId: uuid("subscription_id").references(
      () => subscriptionsTable.id,
      { onDelete: "set null" },
    ),
    plan: text("plan").notNull(),
    razorpayOrderId: text("razorpay_order_id").notNull(),
    razorpayPaymentId: text("razorpay_payment_id"),
    razorpaySignature: text("razorpay_signature"),
    // Amount in the smallest currency unit (paise for INR).
    amount: integer("amount").notNull(),
    currency: text("currency").notNull().default("INR"),
    // "created" | "paid" | "failed"
    status: text("status").notNull().default("created"),
    // Billing period this payment covers (set once paid).
    periodStart: timestamp("period_start", { withTimezone: true }),
    periodEnd: timestamp("period_end", { withTimezone: true }),
    method: text("method"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("payments_order_idx").on(table.razorpayOrderId),
    index("payments_user_idx").on(table.userId),
    index("payments_payment_id_idx").on(table.razorpayPaymentId),
    index("payments_status_idx").on(table.status),
    index("payments_created_idx").on(table.createdAt),
  ],
);

export type Payment = typeof paymentsTable.$inferSelect;
export type InsertPayment = typeof paymentsTable.$inferInsert;
