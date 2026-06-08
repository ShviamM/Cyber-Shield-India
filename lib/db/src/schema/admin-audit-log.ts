import { pgTable, uuid, text, jsonb, timestamp, index } from "drizzle-orm/pg-core";
import { usersTable } from "./users";

/**
 * Immutable audit trail of privileged admin actions (role changes, trial
 * grants/extensions/resets, account suspensions, …). Actor and target are kept
 * as nullable FKs that null out if the user is deleted, while denormalized
 * snapshots (`actorPhone`, `actorRole`) preserve who acted even after deletion.
 * `metadata` holds action-specific context (e.g. days granted, reason, before/
 * after values).
 */
export const adminAuditLogTable = pgTable(
  "admin_audit_log",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    actorUserId: uuid("actor_user_id").references(() => usersTable.id, {
      onDelete: "set null",
    }),
    actorPhone: text("actor_phone"),
    actorRole: text("actor_role"),
    action: text("action").notNull(),
    targetUserId: uuid("target_user_id").references(() => usersTable.id, {
      onDelete: "set null",
    }),
    targetPhone: text("target_phone"),
    reason: text("reason"),
    metadata: jsonb("metadata").$type<Record<string, unknown>>(),
    ip: text("ip"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("admin_audit_log_target_idx").on(table.targetUserId),
    index("admin_audit_log_actor_idx").on(table.actorUserId),
    index("admin_audit_log_created_idx").on(table.createdAt),
  ],
);

export type AdminAuditLog = typeof adminAuditLogTable.$inferSelect;
export type InsertAdminAuditLog = typeof adminAuditLogTable.$inferInsert;
