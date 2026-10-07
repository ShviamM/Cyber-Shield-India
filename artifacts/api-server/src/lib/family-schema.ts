import { sql } from "drizzle-orm";
import { db } from "@workspace/db";
import { logger } from "./logger";

/**
 * Add the Family Guardian columns and table if they don't exist yet. Production
 * schema changes are otherwise applied by hand with drizzle-kit push. Mirrors
 * lib/db/src/schema/family-members.ts and family-alerts.ts.
 */
export async function ensureFamilyGuardianSchema(): Promise<void> {
  try {
    await db.execute(
      sql`ALTER TABLE family_members ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'pending'`,
    );
    await db.execute(
      sql`ALTER TABLE family_members ADD COLUMN IF NOT EXISTS member_user_id uuid REFERENCES users(id) ON DELETE SET NULL`,
    );
    await db.execute(
      sql`ALTER TABLE family_members ADD COLUMN IF NOT EXISTS responded_at timestamptz`,
    );
    await db.execute(
      sql`CREATE INDEX IF NOT EXISTS family_members_phone_idx ON family_members (phone)`,
    );
    await db.execute(
      sql`CREATE INDEX IF NOT EXISTS family_members_member_user_idx ON family_members (member_user_id)`,
    );
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS family_alerts (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        owner_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        member_id uuid NOT NULL REFERENCES family_members(id) ON DELETE CASCADE,
        caller_phone text NOT NULL,
        risk_level text NOT NULL,
        report_count integer NOT NULL DEFAULT 0,
        category text,
        resolved_at timestamptz,
        created_at timestamptz NOT NULL DEFAULT now()
      )
    `);
    await db.execute(
      sql`CREATE INDEX IF NOT EXISTS family_alerts_owner_created_idx ON family_alerts (owner_id, created_at)`,
    );
    await db.execute(
      sql`CREATE INDEX IF NOT EXISTS family_alerts_member_idx ON family_alerts (member_id)`,
    );
  } catch (err) {
    logger.error({ err }, "Failed to ensure Family Guardian schema");
  }
}

/** Family Guardian alerts are kept for this long, then deleted. */
export const FAMILY_ALERT_RETENTION_DAYS = 90;

/** Delete alerts older than the retention period (runs daily). */
export async function pruneOldFamilyAlerts(): Promise<void> {
  try {
    await db.execute(
      sql`DELETE FROM family_alerts WHERE created_at < now() - make_interval(days => ${FAMILY_ALERT_RETENTION_DAYS})`,
    );
  } catch (err) {
    logger.error({ err }, "Failed to prune old family alerts");
  }
}

export function startFamilyAlertPruning(): void {
  const run = () => void ensureFamilyGuardianSchema().then(pruneOldFamilyAlerts);
  run();
  setInterval(() => void pruneOldFamilyAlerts(), 24 * 60 * 60 * 1000).unref();
}
