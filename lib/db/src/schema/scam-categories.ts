import { pgTable, uuid, text, integer, timestamp } from "drizzle-orm/pg-core";

export const scamCategoriesTable = pgTable("scam_categories", {
  id: uuid("id").primaryKey().defaultRandom(),
  key: text("key").notNull().unique(),
  nameEn: text("name_en").notNull(),
  nameHi: text("name_hi"),
  descriptionEn: text("description_en"),
  tipEn: text("tip_en"),
  tipHi: text("tip_hi"),
  icon: text("icon"),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type ScamCategory = typeof scamCategoriesTable.$inferSelect;
export type InsertScamCategory = typeof scamCategoriesTable.$inferInsert;
