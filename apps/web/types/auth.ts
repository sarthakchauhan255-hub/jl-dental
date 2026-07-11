/**
 * Auth-related types — shared between client and server.
 */

export type UserRole =
  | "superadmin"
  | "admin"
  | "receptionist"
  | "content_manager"
  | "doctor";

/**
 * Permissions follow the pattern: resource.action
 * Special: "resource.*" = all actions on resource
 * Special: "*" = superadmin full access
 */
export type Permission =
  // Appointments
  | "appointments.read"
  | "appointments.create"
  | "appointments.update"
  | "appointments.delete"
  | "appointments.read.own"
  // Doctors
  | "doctors.read"
  | "doctors.create"
  | "doctors.update"
  | "doctors.delete"
  | "doctors.update.own"
  // Services
  | "services.read"
  | "services.create"
  | "services.update"
  | "services.delete"
  // Blog
  | "blog.read"
  | "blog.create"
  | "blog.update"
  | "blog.delete"
  // Gallery
  | "gallery.read"
  | "gallery.create"
  | "gallery.update"
  | "gallery.delete"
  // FAQ
  | "faq.read"
  | "faq.create"
  | "faq.update"
  | "faq.delete"
  // Reviews
  | "reviews.read"
  | "reviews.update"
  // Clinic config
  | "clinic.read"
  | "clinic.update"
  // Analytics
  | "analytics.read"
  // Media
  | "media.upload"
  | "media.delete"
  // Users (admin management)
  | "users.read"
  | "users.create"
  | "users.update"
  | "users.delete";

/** JWT token payload stored in httpOnly cookie */
export interface SessionPayload {
  userId:       string;
  role:         UserRole;
  clinicId:     string | null;
  tokenVersion: number;
  iat:          number;
  exp:          number;
}

/** Safe user object returned to client (no sensitive fields) */
export interface AuthUser {
  id:        string;
  name:      string;
  email:     string;
  role:      UserRole;
  clinicId:  string | null;
  isActive:  boolean;
}
