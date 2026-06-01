import type { NextFunction, Request, Response } from "express";
import { db, sessionsTable, usersTable, type User } from "@workspace/db";
import { eq } from "drizzle-orm";
import { hashToken } from "../lib/token";
import { HttpError } from "../lib/http-error";

function extractToken(req: Request): string | null {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) return null;
  const token = header.slice(7).trim();
  return token || null;
}

async function authenticate(req: Request): Promise<User | null> {
  const token = extractToken(req);
  if (!token) return null;

  const [row] = await db
    .select({ user: usersTable, expiresAt: sessionsTable.expiresAt })
    .from(sessionsTable)
    .innerJoin(usersTable, eq(sessionsTable.userId, usersTable.id))
    .where(eq(sessionsTable.tokenHash, hashToken(token)))
    .limit(1);

  if (!row) return null;
  if (row.expiresAt.getTime() < Date.now()) return null;
  return row.user;
}

export async function requireAuth(
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> {
  const user = await authenticate(req);
  if (!user) {
    return next(new HttpError(401, "unauthorized", "Authentication required"));
  }
  if (user.status === "blocked") {
    return next(new HttpError(403, "blocked", "Your account has been blocked"));
  }
  req.user = user;
  next();
}

export async function requireAdmin(
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> {
  const user = await authenticate(req);
  if (!user) {
    return next(new HttpError(401, "unauthorized", "Authentication required"));
  }
  if (user.status === "blocked") {
    return next(new HttpError(403, "blocked", "Your account has been blocked"));
  }
  if (!user.isAdmin) {
    return next(new HttpError(403, "forbidden", "Admin access required"));
  }
  req.user = user;
  next();
}
