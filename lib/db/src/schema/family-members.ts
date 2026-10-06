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
 * People a user protects under the Family plan. The server is the source of
 * truth: it enforces the per-plan member cap and only Family-plan owners may
 * keep members. Phone is stored normalized; a number can appear once per owner.
 */
export const familyMembersTable = pgTable(
  "family_members",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    ownerId: uuid("owner_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    // Normalized Indian phone number of the protected person.
    phone: text("phone").notNull(),
    // Optional free-text relationship label (e.g. "Mother", "Son").
    relationship: text("relationship"),
    // Family Guardian consent. Adding a member is an invite: the person signs in
    // to Netraksh with this phone number and accepts before any of their calls
    // can alert the owner. "pending" | "accepted" | "declined".
    status: text("status").notNull().default("pending"),
    // The member's own account, set when they accept.
    memberUserId: uuid("member_user_id").references(() => usersTable.id, {
      onDelete: "set null",
    }),
    respondedAt: timestamp("responded_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("family_members_owner_phone_idx").on(table.ownerId, table.phone),
    index("family_members_owner_idx").on(table.ownerId),
    index("family_members_phone_idx").on(table.phone),
    index("family_members_member_user_idx").on(table.memberUserId),
  ],
);

export type FamilyMember = typeof familyMembersTable.$inferSelect;
export type InsertFamilyMember = typeof familyMembersTable.$inferInsert;
