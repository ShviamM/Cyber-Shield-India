import {
  pgTable,
  uuid,
  text,
  timestamp,
  uniqueIndex,
  index,
} from "drizzle-orm/pg-core";
import { usersTable } from "./users";

/**
 * Expo push tokens registered by a user's devices. A user can have several
 * (one per device); the token is globally unique. Admin broadcasts are sent to
 * every token in this table via the Expo Push API.
 */
export const deviceTokensTable = pgTable(
  "device_tokens",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    // The Expo push token, e.g. "ExponentPushToken[xxxxxxxx]".
    token: text("token").notNull(),
    // "ios" | "android" | "web" (best-effort, from the client).
    platform: text("platform"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("device_tokens_token_idx").on(table.token),
    index("device_tokens_user_idx").on(table.userId),
  ],
);

export type DeviceToken = typeof deviceTokensTable.$inferSelect;
export type InsertDeviceToken = typeof deviceTokensTable.$inferInsert;
