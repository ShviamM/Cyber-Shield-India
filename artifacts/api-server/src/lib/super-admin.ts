import type { User } from "@workspace/db";
import { config } from "../config";

/**
 * A user is a "super admin" (platform owner) when they are an admin AND their
 * phone is in the configured owner set. The Super Admin dashboard exposes
 * cost/infra data, so it is gated more tightly than the moderation console.
 */
export function isSuperAdmin(user: Pick<User, "isAdmin" | "phone">): boolean {
  return user.isAdmin && config.superAdminPhones.includes(user.phone);
}
