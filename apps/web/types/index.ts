/**
 * Core shared types — used across models, API, and UI.
 * Keep this file lean: domain primitives and shared interfaces only.
 */

// ─── Media ──────────────────────────────────────────────────────────────────
export interface MediaAsset {
  url:       string;
  publicId:  string;
  alt?:      string;
  width?:    number;
  height?:   number;
}

// ─── API Envelope ────────────────────────────────────────────────────────────
export interface ApiResponse<T = unknown> {
  success:  boolean;
  data?:    T;
  error?:   string;
  message?: string;
}

export interface PaginationMeta {
  page:       number;
  limit:      number;
  total:      number;
  totalPages: number;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: PaginationMeta;
}

// ─── SEO ────────────────────────────────────────────────────────────────────
export interface SeoMeta {
  title:        string;
  description:  string;
  ogImage?:     MediaAsset | null;
  noIndex?:     boolean;
  canonical?:   string;
}

// ─── Appointment ─────────────────────────────────────────────────────────────
export type AppointmentStatus =
  | "pending"
  | "approved"
  | "rescheduled"
  | "rejected"
  | "cancelled"
  | "completed"
  | "no_show"
  | "expired";

export type AppointmentTimeSlot = "morning" | "afternoon" | "evening";
export type AppointmentUrgency  = "normal"  | "soon"      | "urgent";

export interface AppointmentStatusHistory {
  status:    AppointmentStatus;
  changedBy: string;
  note?:     string;
  timestamp: Date;
}

// ─── Blog ────────────────────────────────────────────────────────────────────
export type BlogStatus = "draft" | "published";

// ─── Reviews ─────────────────────────────────────────────────────────────────
export type ReviewStatus = "pending" | "approved" | "rejected";
export type ReviewSource  = "website" | "google" | "manual";

// ─── Gallery ─────────────────────────────────────────────────────────────────
export type GalleryType = "before_after" | "general";

// ─── Notifications ───────────────────────────────────────────────────────────
export type NotificationChannel = "email" | "whatsapp" | "sms";
export type NotificationStatus  = "sent"  | "failed"   | "permanently_failed";

// ─── Working Hours ───────────────────────────────────────────────────────────
export interface DayHours {
  open:   string;  // "09:00"
  close:  string;  // "18:00"
  closed: boolean;
}

export interface WorkingHours {
  monday:    DayHours;
  tuesday:   DayHours;
  wednesday: DayHours;
  thursday:  DayHours;
  friday:    DayHours;
  saturday:  DayHours;
  sunday:    DayHours;
}

// ─── Clinic Social ───────────────────────────────────────────────────────────
export interface ClinicSocialLinks {
  instagram?:     string;
  facebook?:      string;
  googleBusiness?: string;
  whatsapp?:      string;
}

// ─── Clinic Location ─────────────────────────────────────────────────────────
export interface ClinicLocation {
  latitude:  number;
  longitude: number;
}

// ─── Nav ─────────────────────────────────────────────────────────────────────
export interface NavLink {
  label: string;
  href:  string;
  icon?: string;
}
