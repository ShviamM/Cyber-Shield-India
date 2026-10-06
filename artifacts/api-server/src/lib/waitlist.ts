import { sql } from "drizzle-orm";
import { db } from "@workspace/db";
import { logger } from "./logger";

/**
 * Create the launch_waitlist and contact_messages tables if they don't exist yet. Production schema
 * changes are otherwise applied by hand with drizzle-kit push, so this keeps the
 * website forms working on first deploy. Mirrors lib/db/src/schema/launch-waitlist.ts
 * and lib/db/src/schema/contact-messages.ts.
 */
export async function ensureWebsiteFormTables(): Promise<void> {
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
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS contact_messages (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        name text NOT NULL,
        email text NOT NULL,
        subject text NOT NULL,
        message text NOT NULL,
        lang text NOT NULL DEFAULT 'en',
        status text NOT NULL DEFAULT 'new',
        created_at timestamptz NOT NULL DEFAULT now()
      )
    `);
    await db.execute(
      sql`CREATE INDEX IF NOT EXISTS contact_messages_status_idx ON contact_messages (status)`,
    );
    await db.execute(
      sql`CREATE INDEX IF NOT EXISTS contact_messages_created_idx ON contact_messages (created_at)`,
    );
  } catch (err) {
    logger.error({ err }, "Failed to ensure website form tables");
  }
}
