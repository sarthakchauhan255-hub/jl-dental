/**
 * Models barrel export.
 * Import models from here — ensures consistent registration order.
 *
 * IMPORTANT: Always import from this file in API routes and server actions.
 * Never import individual model files directly — registration order matters.
 */

// ─── Core ─────────────────────────────────────────────────────────────────────
export { User }                  from "./User";
export { Clinic }                from "./Clinic";

// ─── Content ─────────────────────────────────────────────────────────────────
export { Doctor }                from "./Doctor";
export { Service }               from "./Service";
export { BlogPost }              from "./BlogPost";
export { Gallery }               from "./Gallery";
export { FAQ }                   from "./FAQ";
export { Review }                from "./Review";

// ─── Operational ─────────────────────────────────────────────────────────────
export { Appointment }           from "./Appointment";

// ─── System ──────────────────────────────────────────────────────────────────
export { NotificationLog }       from "./NotificationLog";
export { AuthLog }               from "./AuthLog";
export { AuditLog }              from "./AuditLog";
export { MediaPendingCleanup }   from "./MediaPendingCleanup";
export { PasswordResetToken }    from "./PasswordResetToken";

// ─── Re-export types for convenience ─────────────────────────────────────────
export type { IUser }               from "./User";
export type { IClinic }             from "./Clinic";
export type { IDoctor }             from "./Doctor";
export type { IService }            from "./Service";
export type { IBlogPost }           from "./BlogPost";
export type { IGalleryItem }        from "./Gallery";
export type { IFAQ }                from "./FAQ";
export type { IReview }             from "./Review";
export type { IAppointment }        from "./Appointment";
export type { INotificationLog }    from "./NotificationLog";
export type { IAuthLog, AuthEvent } from "./AuthLog";
export type { IAuditLog, AuditAction, AuditResource } from "./AuditLog";
export type { IMediaPendingCleanup } from "./MediaPendingCleanup";
export type { IPasswordResetToken }  from "./PasswordResetToken";
