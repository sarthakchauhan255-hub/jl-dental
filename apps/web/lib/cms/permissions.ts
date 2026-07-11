/**
 * CMS Permission Engine.
 *
 * ARCHITECTURE:
 *  • Delegates 100% to the existing RBAC system (lib/auth/rbac.ts).
 *  • No duplicate authorization system.
 *  • Client-side checks control VISIBILITY only — never authorize operations.
 *  • Server-side: requirePermission() from lib/auth/rbac.ts is the enforcer.
 *  • "update" permission is the fallback for publish/archive if not specified.
 */
import { hasPermission }              from "@/lib/auth/rbac";
import type { Permission }            from "@/types/auth";
import type { AuthUser }              from "@/types/auth";
import type { CmsResourceConfig, CmsRecord } from "./types";

type AuthContext = Pick<AuthUser, "role">;

// ─── CMS action types (structural — engine uses these for dispatch) ────────────
// This is NOT a status enum. It's the set of CRUD lifecycle operations.
export type CmsOperationType =
  | "create" | "update" | "delete"
  | "publish" | "unpublish" | "archive" | "restore"
  | "duplicate" | "read";

/** Resolve the Permission string for a given operation from a resource's permission config. */
export function resolvePermission<T extends CmsRecord>(
  config:    Pick<CmsResourceConfig<T>, "permissions">,
  operation: CmsOperationType,
): Permission {
  switch (operation) {
    case "read":      return config.permissions.read;
    case "create":    return config.permissions.create;
    case "update":    return config.permissions.update;
    case "delete":    return config.permissions.delete;
    case "publish":
    case "unpublish": return config.permissions.publish   ?? config.permissions.update;
    case "archive":
    case "restore":   return config.permissions.archive   ?? config.permissions.update;
    case "duplicate": return config.permissions.create;
  }
}

/**
 * Check whether a user can perform an operation on a resource.
 * CLIENT-SIDE ONLY — for UI visibility decisions.
 * Server-side: always call requirePermission() from lib/auth/rbac.ts.
 */
export function canPerform<T extends CmsRecord>(
  user:      AuthContext | null | undefined,
  config:    Pick<CmsResourceConfig<T>, "permissions">,
  operation: CmsOperationType,
): boolean {
  if (!user) return false;
  return hasPermission(user.role, resolvePermission(config, operation));
}

/** Returns a map of all operations → allowed for a user on a resource. */
export function resolveAllPermissions<T extends CmsRecord>(
  user:   AuthContext | null | undefined,
  config: Pick<CmsResourceConfig<T>, "permissions">,
): Record<CmsOperationType, boolean> {
  const ops: CmsOperationType[] = [
    "create", "read", "update", "delete",
    "publish", "unpublish", "archive", "restore", "duplicate",
  ];
  const result = {} as Record<CmsOperationType, boolean>;
  for (const op of ops) {
    result[op] = canPerform(user, config, op);
  }
  return result;
}
