import type { UserRole, Permission } from "@/types/auth";

type PermissionEntry = Permission | "*";

export const ROLE_PERMISSIONS: Record<UserRole, PermissionEntry[]> = {
  superadmin: ["*"],

  admin: [
    "appointments.read","appointments.create","appointments.update","appointments.delete",
    "doctors.read","doctors.create","doctors.update","doctors.delete",
    "services.read","services.create","services.update","services.delete",
    "blog.read","blog.create","blog.update","blog.delete",
    "gallery.read","gallery.create","gallery.update","gallery.delete",
    "faq.read","faq.create","faq.update","faq.delete",
    "reviews.read","reviews.update",
    "clinic.read","clinic.update",
    "analytics.read",
    "media.upload","media.delete",
  ],

  receptionist: [
    "appointments.read","appointments.update",
    "doctors.read","services.read","reviews.read","analytics.read",
  ],

  content_manager: [
    "blog.read","blog.create","blog.update","blog.delete",
    "gallery.read","gallery.create","gallery.update","gallery.delete",
    "faq.read","faq.create","faq.update","faq.delete",
    "services.read","services.update",
    "media.upload","media.delete",
    "clinic.read",
  ],

  doctor: [
    "appointments.read.own",
    "doctors.read","doctors.update.own",
  ],
};

export function hasPermission(role: UserRole, permission: Permission): boolean {
  const perms = ROLE_PERMISSIONS[role];
  if (perms.includes("*")) return true;
  if (perms.includes(permission)) return true;
  const [resource] = permission.split(".");
  if (perms.includes(`${resource}.*` as PermissionEntry)) return true;
  return false;
}

export function requirePermission(role: UserRole, permission: Permission): void {
  if (!hasPermission(role, permission)) throw new Error("FORBIDDEN");
}
