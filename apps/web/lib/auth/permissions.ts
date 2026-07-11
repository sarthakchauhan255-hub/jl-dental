/**
 * Named permission helpers.
 * Use these throughout the app — never raw role string comparisons.
 *
 * import { canManageAppointments } from "@/lib/auth/permissions";
 * if (!canManageAppointments(user)) throw new ForbiddenError();
 */
import { hasPermission } from "@/lib/auth/rbac";
import type { AuthUser, SessionPayload } from "@/types/auth";

type AuthContext = Pick<AuthUser | SessionPayload, "role">;

export const canManageAppointments = (u: AuthContext) =>
  hasPermission(u.role, "appointments.update");

export const canViewAppointments = (u: AuthContext) =>
  hasPermission(u.role, "appointments.read");

export const canManageDoctors = (u: AuthContext) =>
  hasPermission(u.role, "doctors.create");

export const canEditDoctors = (u: AuthContext) =>
  hasPermission(u.role, "doctors.update");

export const canManageServices = (u: AuthContext) =>
  hasPermission(u.role, "services.create");

export const canManageBlog = (u: AuthContext) =>
  hasPermission(u.role, "blog.create");

export const canManageGallery = (u: AuthContext) =>
  hasPermission(u.role, "gallery.create");

export const canManageFAQ = (u: AuthContext) =>
  hasPermission(u.role, "faq.create");

export const canModerateReviews = (u: AuthContext) =>
  hasPermission(u.role, "reviews.update");

export const canEditClinicConfig = (u: AuthContext) =>
  hasPermission(u.role, "clinic.update");

export const canUploadMedia = (u: AuthContext) =>
  hasPermission(u.role, "media.upload");

export const canViewAnalytics = (u: AuthContext) =>
  hasPermission(u.role, "analytics.read");

export const canManageUsers = (u: AuthContext) =>
  hasPermission(u.role, "users.create");

export const isSuperAdmin = (u: AuthContext) => u.role === "superadmin";
