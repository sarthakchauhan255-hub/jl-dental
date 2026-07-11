"use client";
/**
 * UI permission hooks. For show/hide decisions only.
 * Security enforcement happens server-side in API handlers.
 */
import { useAuth }       from "@/context/auth-context";
import { hasPermission } from "@/lib/auth/rbac";
import type { Permission } from "@/types/auth";

export function usePermission(permission: Permission): boolean {
  const { user, loading } = useAuth();
  if (loading || !user) return false;
  return hasPermission(user.role, permission);
}

export function useAnyPermission(...permissions: Permission[]): boolean {
  const { user, loading } = useAuth();
  if (loading || !user) return false;
  return permissions.some((p) => hasPermission(user.role, p));
}
