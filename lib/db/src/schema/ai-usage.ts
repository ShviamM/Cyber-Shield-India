import {
  pgTable,
  uuid,
  text,
  integer,
  timestamp,
  index,
} from "drizzle-orm/pg-core";

/**
 * Per-call token usage for AI model calls (currently scam-message
 * classification). Stored so the Super Admin dashboard can report real AI
 * consumption and an estimated cost. We persist token counts (the source of
 * truth) rather than a frozen dollar amount, so the cost estimate can be
 * recomputed from current pricing constants.
 */
export const aiUsageTable = pgTable(
  "ai_usage",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    // The model that served the request, e.g. "gpt-5-mini".
    model: text("model").notNull(),
    // Logical operation that triggered the call, e.g. "classify_message".
    operation: text("operation").notNull(),
    promptTokens: integer("prompt_tokens").notNull().default(0),
    completionTokens: integer("completion_tokens").notNull().default(0),
    totalTokens: integer("total_tokens").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [index("ai_usage_created_idx").on(table.createdAt)],
);

export type AiUsage = typeof aiUsageTable.$inferSelect;
export type InsertAiUsage = typeof aiUsageTable.$inferInsert;
