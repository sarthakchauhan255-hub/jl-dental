import { Calendar, Check, X, CheckCircle, XCircle, RotateCcw } from "lucide-react";
import { ResourceStatusBadge } from "@/components/cms/engine";
import { buildCacheConfig }    from "@/lib/cms/cache";
import { CACHE_TAGS }          from "@/lib/cache";
import type { CmsResourceConfig, CmsStatusConfig } from "@/lib/cms/types";
import type { AppointmentRecord, AppointmentStatus, AppointmentService } from "../service/appointments.service";

// Appointments don't appear in public cache — admin only
export const APPOINTMENT_CACHE = buildCacheConfig("appointments", false);

type AS = AppointmentStatus;
export const appointmentStatusConfig: CmsStatusConfig<AS> = {
  field:         "status",
  defaultStatus: "pending",
  definitions: [
    { value: "pending",     label: "Pending",     badgeVariant: "warning", allowedTransitions: ["approved","rejected","cancelled"] },
    { value: "approved",    label: "Approved",    badgeVariant: "success", allowedTransitions: ["completed","rescheduled","cancelled","no_show"] },
    { value: "rescheduled", label: "Rescheduled", badgeVariant: "info",    allowedTransitions: ["approved","rejected","cancelled"] },
    { value: "rejected",    label: "Rejected",    badgeVariant: "error",   allowedTransitions: [], terminal: true },
    { value: "cancelled",   label: "Cancelled",   badgeVariant: "neutral", allowedTransitions: [], terminal: true },
    { value: "completed",   label: "Completed",   badgeVariant: "success", allowedTransitions: [], terminal: true },
    { value: "no_show",     label: "No Show",     badgeVariant: "error",   allowedTransitions: [], terminal: true },
    { value: "expired",     label: "Expired",     badgeVariant: "neutral", allowedTransitions: [], terminal: true },
  ],
};

const STATUS_DEF: Record<AS, (typeof appointmentStatusConfig.definitions)[0]> = Object.fromEntries(
  appointmentStatusConfig.definitions.map(d => [d.value, d])
) as Record<AS, (typeof appointmentStatusConfig.definitions)[0]>;

export const appointmentConfig: CmsResourceConfig<AppointmentRecord, AS> = {
  meta:    { label: "Appointment", labelPlural: "Appointments", icon: Calendar },
  routes:  { apiPath: "/api/appointments", adminPath: "/admin/appointments" },
  permissions: { read: "appointments.read", create: "appointments.create", update: "appointments.update", delete: "appointments.delete" },
  status:  appointmentStatusConfig,
  cache:   APPOINTMENT_CACHE,
  audit:   { resourceName: "appointment" },
  table: {
    displayField: "patientName",
    search: { placeholder: "Search appointments…", fields: ["patientName","email","service"] },
    filters: [
      { key: "status", label: "Status", type: "status",
        options: appointmentStatusConfig.definitions.map(d => ({ label: d.label, value: d.value })) },
    ],
    columns: [
      { key: "patient",  header: "Patient",  sortable: true, cell: r => r.patientName },
      { key: "service",  header: "Service",                  cell: r => r.service },
      { key: "date",     header: "Date",     sortable: true, cell: r => r.preferredDate },
      { key: "status",   header: "Status",                   cell: r => <ResourceStatusBadge definition={STATUS_DEF[r.status as AS]} /> },
    ],
  },
  actions: [
    { id: "approve",   label: "Approve",   icon: Check,        scope: ["row"], permission: "appointments.update",
      isAvailable: r => ["pending","rescheduled"].includes(r.status as string),
      executor: async (r,s) => { const svc = s as AppointmentService; await svc.approve(r.id); },
    },
    { id: "complete",  label: "Complete",  icon: CheckCircle,  scope: ["row"], permission: "appointments.update",
      isAvailable: r => r.status === "approved",
      executor: async (r,s) => { const svc = s as AppointmentService; await svc.complete(r.id); },
    },
    { id: "reject",    label: "Reject",    icon: X,            scope: ["row"], permission: "appointments.update", destructive: true,
      isAvailable: r => ["pending","rescheduled"].includes(r.status as string),
      confirm: { title: "Reject appointment?", description: r => `Reject ${r.patientName}'s appointment?` },
      executor: async (r,s) => { const svc = s as AppointmentService; await svc.reject(r.id); },
    },
    { id: "cancel",    label: "Cancel",    icon: XCircle,      scope: ["row"], permission: "appointments.update", destructive: true,
      isAvailable: r => ["pending","approved","rescheduled"].includes(r.status as string),
      confirm: { title: "Cancel appointment?", description: r => `Cancel ${r.patientName}'s appointment?` },
      executor: async (r,s) => { const svc = s as AppointmentService; await svc.cancel(r.id); },
    },
  ],
};
