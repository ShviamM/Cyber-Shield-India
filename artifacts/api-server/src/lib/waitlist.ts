import { sql } from "drizzle-orm";
import { db } from "@workspace/db";
import { logger } from "./logger";

/**
 * Create the launch_waitlist table if it doesn't exist yet. Production schema
 * changes are otherwise applied by hand with drizzle-kit push, so this keeps the
 * sign-up form working on first deploy. Mirrors lib/db/src/schema/launch-waitlist.ts.
 */
export async function ensureWaitlistTable(): Promise<void> {
  try {
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS launch_waitlist (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        contact text NOT NULL,
        contact_type text NOT NULL,
        lang text NOT NULL DEFAULT 'en',
        source text NOT NULL DEFAULT 'website',
        created_at timestamptz NOT NULL DEFAULT now()
      )
    `);
    await db.execute(
      sql`CREATE UNIQUE INDEX IF NOT EXISTS launch_waitlist_contact_idx ON launch_waitlist (contact)`,
    );
  } catch (err) {
    logger.error({ err }, "Failed to ensure launch_waitlist table");
  }
}
