/**
 * Role constants — never use raw strings for role checks.
 */
export const ROLES = {
  SUPERADMIN:      "superadmin",
  ADMIN:           "admin",
  RECEPTIONIST:    "receptionist",
  CONTENT_MANAGER: "content_manager",
  DOCTOR:          "doctor",
} as const;

export type UserRole = (typeof ROLES)[keyof typeof ROLES];

/** Roles that receive daily digest emails */
export const DIGEST_RECIPIENT_ROLES: UserRole[] = [
  ROLES.SUPERADMIN,
  ROLES.ADMIN,
];

/** Roles with full CMS access */
export const CMS_ROLES: UserRole[] = [
  ROLES.SUPERADMIN,
  ROLES.ADMIN,
  ROLES.CONTENT_MANAGER,
];

/** Roles that can manage appointments */
export const APPOINTMENT_ROLES: UserRole[] = [
  ROLES.SUPERADMIN,
  ROLES.ADMIN,
  ROLES.RECEPTIONIST,
];
