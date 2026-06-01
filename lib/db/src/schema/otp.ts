import { pgTable, uuid, text, integer, timestamp, index } from "drizzle-orm/pg-core";

export const otpCodesTable = pgTable(
  "otp_codes",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    phone: text("phone").notNull(),
    codeHash: text("code_hash").notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    consumedAt: timestamp("consumed_at", { withTimezone: true }),
    attempts: integer("attempts").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("otp_codes_phone_idx").on(table.phone)],
);

export type OtpCode = typeof otpCodesTable.$inferSelect;
export type InsertOtpCode = typeof otpCodesTable.$inferInsert;
