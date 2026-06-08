import { pgTable, text, jsonb, boolean, timestamp } from "drizzle-orm/pg-core";

/**
 * Data-driven roles for the RBAC system. Each role carries the set of
 * permission keys it grants (a `"*"` entry grants every permission). New roles
 * can be added as plain rows here without any code change — the permission
 * engine resolves a user's capabilities from this table at request time.
 *
 * `isSystem` marks the built-in roles seeded by the server so the UI can stop
 * them from being deleted or renamed.
 */
export const rolesTable = pgTable("roles", {
  name: text("name").primaryKey(),
  label: text("label").notNull(),
  description: text("description"),
  permissions: jsonb("permissions").$type<string[]>().notNull().default([]),
  isSystem: boolean("is_system").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type Role = typeof rolesTable.$inferSelect;
export type InsertRole = typeof rolesTable.$inferInsert;
