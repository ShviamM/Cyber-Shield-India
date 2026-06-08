import type { Request } from "express";
import { eq } from "drizzle-orm";
import { db, sessionsTable, usersTable } from "@workspace/db";
import { hashToken } from "./token";
import { getEffectiveSubscription } from "./subscription";

export interface Caller {
  userId: string;
  isPremium: boolean;
}

/**
 * Resolve an optional Bearer-token caller and their premium status. Used by
 * endpoints that stay open to everyone (the advertised free features) but meter
 * or unlock behaviour based on the signed-in account. Any auth failure silently
 * falls back to anonymous (`null`) — it never blocks the request.
 */
export async function resolveOptionalCaller(
  req: Request,
): Promise<Caller | null> {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) return null;
  const token = header.slice(7).trim();
  if (!token) return null;
  try {
    const [row] = await db
      .select({ user: usersTable, expiresAt: sessionsTable.expiresAt })
      .from(sessionsTable)
      .innerJoin(usersTable, eq(sessionsTable.userId, usersTable.id))
      .where(eq(sessionsTable.tokenHash, hashToken(token)))
      .limit(1);
    if (!row || row.expiresAt.getTime() < Date.now()) return null;
    if (row.user.status === "blocked") return null;
    const sub = await getEffectiveSubscription(row.user.id);
    return { userId: row.user.id, isPremium: sub.isPremium };
  } catch {
    return null;
  }
}

/** Stable per-caller usage subject: account-scoped when signed in, else per-IP. */
export function usageSubject(req: Request, caller: Caller | null): string {
  return caller ? `user:${caller.userId}` : `ip:${req.ip ?? "unknown"}`;
}
