import {
  pgTable,
  uuid,
  text,
  integer,
  timestamp,
  unique,
  index,
} from "drizzle-orm/pg-core";

/**
 * Per-subject daily usage counters that back the freemium quota gate. Free users
 * get a fixed allowance of number lookups and AI fraud checks per day; premium
 * users are never metered. A row is one (subject, day, kind) bucket; the unique
 * index makes the increment an atomic upsert so concurrent requests cannot slip
 * past the cap.
 *
 *  - `subject` — "user:<uuid>" for signed-in callers, "ip:<addr>" for anonymous.
 *  - `day`     — the usage day in IST (Asia/Kolkata) as YYYY-MM-DD, so the quota
 *                resets at local midnight for our India-based users.
 *  - `kind`    — "number_check" or "ai_check".
 */
export const dailyUsageTable = pgTable(
  "daily_usage",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    subject: text("subject").notNull(),
    day: text("day").notNull(),
    kind: text("kind").notNull(),
    count: integer("count").notNull().default(0),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    unique("daily_usage_subject_day_kind_uniq").on(
      table.subject,
      table.day,
      table.kind,
    ),
    index("daily_usage_day_idx").on(table.day),
  ],
);

export type DailyUsage = typeof dailyUsageTable.$inferSelect;
export type InsertDailyUsage = typeof dailyUsageTable.$inferInsert;
