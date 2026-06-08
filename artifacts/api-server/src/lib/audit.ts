import type { Request } from "express";
import { db, adminAuditLogTable, type User } from "@workspace/db";
import { effectiveRoleName } from "./rbac";
import { logger } from "./logger";

export interface AuditParams {
  actor: User;
  action: string;
  targetUserId?: string | null;
  targetPhone?: string | null;
  reason?: string | null;
  metadata?: Record<string, unknown> | null;
  req?: Request;
}

/**
 * Append an entry to the admin audit trail. Best-effort: a logging failure must
 * never break the privileged action it records, so errors are swallowed and
 * logged. Actor identity is snapshotted (phone + role) so the record survives
 * even if the user is later deleted.
 */
export async function writeAudit(params: AuditParams): Promise<void> {
  try {
    await db.insert(adminAuditLogTable).values({
      actorUserId: params.actor.id,
      actorPhone: params.actor.phone,
      actorRole: effectiveRoleName(params.actor),
      action: params.action,
      targetUserId: params.targetUserId ?? null,
      targetPhone: params.targetPhone ?? null,
      reason: params.reason ?? null,
      metadata: params.metadata ?? null,
      ip: params.req?.ip ?? null,
    });
  } catch (err) {
    logger.error({ err, action: params.action }, "Failed to write audit log");
  }
}
