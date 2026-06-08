import { db, rolesTable, usersTable, type User } from "@workspace/db";
import { and, eq, inArray, sql } from "drizzle-orm";
import { config } from "../config";
import { isSuperAdmin } from "./super-admin";
import { logger } from "./logger";

/**
 * Central catalogue of every permission the system understands. Permissions are
 * the unit of access; roles are bundles of permissions stored in the `roles`
 * table. Adding a brand-new *role* needs no code change (insert a row); adding a
 * brand-new *permission* is the only thing that touches code, because some route
 * must actually enforce it.
 */
export const PERMISSIONS = {
  VIEW_DASHBOARD: "view_dashboard",
  MODERATE_REPORTS: "moderate_reports",
  MANAGE_NUMBERS: "manage_numbers",
  SEND_BROADCASTS: "send_broadcasts",
  VIEW_BUSINESS_METRICS: "view_business_metrics",
  VIEW_FRAUD_MAP: "view_fraud_map",
  VIEW_SUPER_ADMIN: "view_super_admin",
  VIEW_USERS: "view_users",
  /** Full trial control: extend by any amount, reactivate, reset. */
  MANAGE_TRIALS: "manage_trials",
  /** Limited trial help (e.g. support): a single, short extension only. */
  EXTEND_TRIAL_LIMITED: "extend_trial_limited",
  /** Assign/clear staff roles on other users. */
  MANAGE_ROLES: "manage_roles",
  /** Suspend / reactivate user accounts. */
  MANAGE_ACCOUNT_STATUS: "manage_account_status",
  VIEW_AUDIT_LOG: "view_audit_log",
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

/** Wildcard permission: a role holding this is granted everything. */
export const ALL_PERMISSIONS = "*";

interface RoleSeed {
  name: string;
  label: string;
  description: string;
  permissions: string[];
  isSystem: boolean;
}

/**
 * Built-in roles seeded on boot. These are the defaults; a super admin can edit
 * them or add new roles via the API at runtime. `subscriber` and `trial` exist
 * as first-class roles for completeness, but end-user *entitlement* (premium
 * access) stays governed by the subscription engine — these roles carry no
 * admin permissions.
 */
export const SYSTEM_ROLES: RoleSeed[] = [
  {
    name: "super_admin",
    label: "Super Admin",
    description: "Platform owner with unrestricted access.",
    permissions: [ALL_PERMISSIONS],
    isSystem: true,
  },
  {
    name: "admin",
    label: "Admin",
    description: "Full operations access except owner-only cost/infra views.",
    permissions: [
      PERMISSIONS.VIEW_DASHBOARD,
      PERMISSIONS.MODERATE_REPORTS,
      PERMISSIONS.MANAGE_NUMBERS,
      PERMISSIONS.SEND_BROADCASTS,
      PERMISSIONS.VIEW_BUSINESS_METRICS,
      PERMISSIONS.VIEW_FRAUD_MAP,
      PERMISSIONS.VIEW_USERS,
      PERMISSIONS.MANAGE_TRIALS,
      PERMISSIONS.MANAGE_ACCOUNT_STATUS,
      PERMISSIONS.VIEW_AUDIT_LOG,
    ],
    isSystem: true,
  },
  {
    name: "support",
    label: "Support Agent",
    description:
      "Helps users: view accounts, view fraud map, grant a single limited trial extension.",
    permissions: [
      PERMISSIONS.VIEW_DASHBOARD,
      PERMISSIONS.VIEW_USERS,
      PERMISSIONS.VIEW_FRAUD_MAP,
      PERMISSIONS.EXTEND_TRIAL_LIMITED,
    ],
    isSystem: true,
  },
  {
    name: "subscriber",
    label: "Subscriber",
    description: "Paying end user. Entitlement handled by the subscription engine.",
    permissions: [],
    isSystem: true,
  },
  {
    name: "trial",
    label: "Trial User",
    description: "End user on a free trial. Entitlement handled by the subscription engine.",
    permissions: [],
    isSystem: true,
  },
  {
    name: "user",
    label: "User",
    description: "Baseline registered end user.",
    permissions: [],
    isSystem: true,
  },
];

/** Cap on how many days a limited (support) extension may grant. */
export const SUPPORT_MAX_EXTENSION_DAYS = 7;

// In-memory cache of role -> permissions, refreshed on boot and after any role
// mutation. Avoids a roles read on every authorized request.
let roleCache: Map<string, string[]> | null = null;

async function loadRoleCache(): Promise<Map<string, string[]>> {
  const rows = await db
    .select({ name: rolesTable.name, permissions: rolesTable.permissions })
    .from(rolesTable);
  const map = new Map<string, string[]>();
  for (const row of rows) map.set(row.name, row.permissions ?? []);
  roleCache = map;
  return map;
}

export async function refreshRoleCache(): Promise<void> {
  await loadRoleCache();
}

async function getCache(): Promise<Map<string, string[]>> {
  return roleCache ?? (await loadRoleCache());
}

/** Permissions granted by a role name (empty when the role is unknown). */
export async function getRolePermissions(role: string): Promise<string[]> {
  const cache = await getCache();
  return cache.get(role) ?? [];
}

/**
 * The effective permission set for a user. Platform owners (super admins by
 * phone allowlist) always get the wildcard so the shared-password owner login
 * keeps full access regardless of the stored role column.
 */
export async function getUserPermissions(user: User): Promise<string[]> {
  if (isSuperAdmin(user)) return [ALL_PERMISSIONS];
  return getRolePermissions(user.role);
}

export async function userHasPermission(
  user: User,
  permission: string,
): Promise<boolean> {
  const perms = await getUserPermissions(user);
  return perms.includes(ALL_PERMISSIONS) || perms.includes(permission);
}

/** The effective role label for a user (owner phone overrides the column). */
export function effectiveRoleName(user: User): string {
  if (isSuperAdmin(user)) return "super_admin";
  return user.role;
}

/**
 * Seed the built-in roles (idempotent — never clobbers runtime edits) and
 * backfill the role column for existing accounts, then warm the cache. Safe to
 * run on every boot; it only fills gaps.
 */
export async function ensureRolesSeeded(): Promise<void> {
  try {
    for (const role of SYSTEM_ROLES) {
      await db
        .insert(rolesTable)
        .values({
          name: role.name,
          label: role.label,
          description: role.description,
          permissions: role.permissions,
          isSystem: role.isSystem,
        })
        .onConflictDoNothing({ target: rolesTable.name });
    }

    // Backfill platform owners -> super_admin (and ensure isAdmin).
    if (config.superAdminPhones.length > 0) {
      await db
        .update(usersTable)
        .set({ role: "super_admin", isAdmin: true, updatedAt: new Date() })
        .where(
          and(
            inArray(usersTable.phone, config.superAdminPhones),
            sql`${usersTable.role} <> 'super_admin'`,
          ),
        );
    }

    // Backfill remaining admins -> admin role.
    await db
      .update(usersTable)
      .set({ role: "admin", updatedAt: new Date() })
      .where(and(eq(usersTable.isAdmin, true), eq(usersTable.role, "user")));

    await refreshRoleCache();
    logger.info("RBAC roles seeded and cache warmed");
  } catch (err) {
    logger.error({ err }, "Failed to seed RBAC roles");
  }
}
