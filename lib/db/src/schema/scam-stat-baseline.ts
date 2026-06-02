import {
  pgTable,
  uuid,
  text,
  integer,
  timestamp,
  index,
  unique,
} from "drizzle-orm/pg-core";

/**
 * Seeded baseline of scam case volumes per city + category, derived from
 * published official figures (NCRB / I4C / data.gov.in). The stats endpoints
 * merge these baselines with live user reports so the app shows meaningful,
 * DB-backed numbers from day one while still growing with real activity.
 *
 * `count` is the current-period (this-week-equivalent) volume and `prevCount`
 * the previous period, used to compute week-over-week change. `source` lets us
 * isolate/remove seeded rows from genuine activity.
 */
export const scamStatBaselineTable = pgTable(
  "scam_stat_baseline",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    city: text("city").notNull(),
    categoryKey: text("category_key").notNull(),
    count: integer("count").notNull().default(0),
    prevCount: integer("prev_count").notNull().default(0),
    source: text("source").notNull().default("baseline"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    unique("scam_stat_baseline_city_category_key").on(table.city, table.categoryKey),
    index("scam_stat_baseline_city_idx").on(table.city),
    index("scam_stat_baseline_category_idx").on(table.categoryKey),
  ],
);

export type ScamStatBaseline = typeof scamStatBaselineTable.$inferSelect;
export type InsertScamStatBaseline = typeof scamStatBaselineTable.$inferInsert;
