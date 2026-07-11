/**
 * Auth domain barrel — session management, RBAC.
 * Import from "@/lib/auth" for session utilities.
 * Import from "@/lib/auth/rbac" for permission checks.
 */
export {
  createToken,
  verifyToken,
  setAuthCookie,
  clearAuthCookie,
  getAuthToken,
  getSession,
  requireSession,
  getAuthUser,
} from "./session";

export {
  ROLE_PERMISSIONS,
  hasPermission,
  requirePermission,
} from "./rbac";
