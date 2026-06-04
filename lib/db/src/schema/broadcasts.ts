import {
  pgTable,
  uuid,
  text,
  integer,
  timestamp,
  index,
} from "drizzle-orm/pg-core";
import { usersTable } from "./users";

/**
 * History of push broadcasts sent from the admin console. Stored so admins can
 * see what was sent, by whom, and how many devices it reached.
 */
export const broadcastsTable = pgTable(
  "broadcasts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    title: text("title").notNull(),
    body: text("body").notNull(),
    // The admin who sent it; kept even if the admin account is later removed.
    sentById: uuid("sent_by_id").references(() => usersTable.id, {
      onDelete: "set null",
    }),
    // Number of device tokens targeted and number Expo accepted for delivery.
    recipientCount: integer("recipient_count").notNull().default(0),
    successCount: integer("success_count").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [index("broadcasts_created_idx").on(table.createdAt)],
);

export type Broadcast = typeof broadcastsTable.$inferSelect;
export type InsertBroadcast = typeof broadcastsTable.$inferInsert;
