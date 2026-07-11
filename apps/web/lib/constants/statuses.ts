/**
 * Status constants with display labels and color variants.
 * Import these for UI rendering — never hardcode status strings.
 */
import type { AppointmentStatus, ReviewStatus, BlogStatus } from "@/types";

export const APPOINTMENT_STATUS_CONFIG: Record<
  AppointmentStatus,
  { label: string; variant: string; description: string }
> = {
  pending:     { label: "Pending",     variant: "pending",     description: "Awaiting admin review" },
  approved:    { label: "Approved",    variant: "approved",    description: "Confirmed by clinic" },
  rescheduled: { label: "Rescheduled", variant: "rescheduled", description: "Time changed by clinic" },
  rejected:    { label: "Rejected",    variant: "rejected",    description: "Request declined" },
  cancelled:   { label: "Cancelled",   variant: "cancelled",   description: "Appointment cancelled" },
  completed:   { label: "Completed",   variant: "completed",   description: "Visit completed" },
  no_show:     { label: "No Show",     variant: "no_show",     description: "Patient did not attend" },
  expired:     { label: "Expired",     variant: "expired",     description: "Pending request timed out" },
};

export const REVIEW_STATUS_CONFIG: Record<
  ReviewStatus,
  { label: string; variant: string }
> = {
  pending:  { label: "Pending",  variant: "pending"  },
  approved: { label: "Approved", variant: "approved" },
  rejected: { label: "Rejected", variant: "rejected" },
};

export const BLOG_STATUS_CONFIG: Record<
  BlogStatus,
  { label: string; variant: string }
> = {
  draft:     { label: "Draft",     variant: "warning" },
  published: { label: "Published", variant: "success" },
};

export const TIME_SLOTS = [
  { value: "morning",   label: "Morning",   hint: "9:00 AM – 12:00 PM" },
  { value: "afternoon", label: "Afternoon", hint: "12:00 PM – 5:00 PM" },
  { value: "evening",   label: "Evening",   hint: "5:00 PM – 8:00 PM"  },
] as const;

export const URGENCY_LEVELS = [
  { value: "normal", label: "Normal",        hint: "No rush" },
  { value: "soon",   label: "Soon",          hint: "Within a week" },
  { value: "urgent", label: "Urgent",        hint: "As soon as possible" },
] as const;
