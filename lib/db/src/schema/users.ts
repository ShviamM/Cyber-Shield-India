import { pgTable, uuid, text, boolean, timestamp, index } from "drizzle-orm/pg-core";

export const usersTable = pgTable(
  "users",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    fullName: text("full_name").notNull(),
    phone: text("phone").notNull().unique(),
    location: text("location"),
    isAdmin: boolean("is_admin").notNull().default(false),
    // Data-driven RBAC role name (FK by value to roles.name). Defaults to the
    // baseline end-user role; staff roles (support/admin/super_admin) are
    // assigned by a super admin. isAdmin is kept in sync for backward compat.
    role: text("role").notNull().default("user"),
    status: text("status").notNull().default("active"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("users_phone_idx").on(table.phone)],
);

export type User = typeof usersTable.$inferSelect;
export type InsertUser = typeof usersTable.$inferInsert;
