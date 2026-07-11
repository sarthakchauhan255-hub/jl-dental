/**
 * Appointment model — complete spec implementation.
 *
 * Key design decisions:
 * - statusHistory[]: append-only audit trail, never modified
 * - confirmedDate/Time: set by admin on approval (separate from patient preference)
 * - reminderSent: tracks each reminder type independently
 * - All future-ready fields (doctorId, slotId, paymentRef) nullable
 */
import mongoose, { Schema, type Document, type Model } from "mongoose";
import type {
  AppointmentStatus,
  AppointmentTimeSlot,
  AppointmentUrgency,
} from "@/types";

export interface IAppointmentStatusHistory {
  status:    AppointmentStatus;
  changedBy: string;           // User ID or "system" (for auto-expire)
  note?:     string;
  timestamp: Date;
}

export interface IAppointmentReminderSent {
  reminder24h: boolean;
  reminder2h:  boolean;
  followup:    boolean;
}

export interface IAppointment extends Document {
  clinicId:       mongoose.Types.ObjectId | null;

  // ─── Patient info ─────────────────────────────────────────────────────
  patientName:    string;
  phone:          string;
  email:          string;
  isNewPatient:   boolean;
  referralSource: string;

  // ─── Request ──────────────────────────────────────────────────────────
  serviceId:      mongoose.Types.ObjectId | null;
  preferredDate:  string;                // ISO date string YYYY-MM-DD
  preferredTime:  AppointmentTimeSlot;
  urgencyLevel:   AppointmentUrgency;
  notes:          string;

  // ─── Confirmed by admin ───────────────────────────────────────────────
  confirmedDate:  string | null;
  confirmedTime:  string | null;

  // ─── Status lifecycle ─────────────────────────────────────────────────
  status:         AppointmentStatus;
  statusHistory:  IAppointmentStatusHistory[];
  adminNotes:     string;               // Private — never shown to patient

  // ─── Notifications ────────────────────────────────────────────────────
  reminderSent:   IAppointmentReminderSent;

  // ─── Future-ready (nullable until features activate) ─────────────────
  doctorId:       mongoose.Types.ObjectId | null;  // Multi-doctor scheduling
  slotId:         string | null;                    // Real-time slot booking
  paymentStatus:  "unpaid" | "paid" | "refunded" | null;
  paymentRef:     string | null;

  // ─── Timestamps ───────────────────────────────────────────────────────
  createdAt:      Date;
  updatedAt:      Date;
}

const StatusHistorySchema = new Schema<IAppointmentStatusHistory>(
  {
    status:    {
      type: String,
      enum: ["pending","approved","rescheduled","rejected","cancelled","completed","no_show","expired"],
      required: true,
    },
    changedBy: { type: String, required: true },
    note:      { type: String, default: "" },
    timestamp: { type: Date,   default: Date.now, immutable: true },
  },
  { _id: false }
);

const AppointmentSchema = new Schema<IAppointment>(
  {
    clinicId:       { type: Schema.Types.ObjectId, ref: "Clinic",  default: null },

    patientName:    { type: String, required: true, trim: true, maxlength: 100 },
    phone:          { type: String, required: true, trim: true, maxlength: 20  },
    email:          { type: String, required: true, lowercase: true, trim: true },
    isNewPatient:   { type: Boolean, default: true },
    referralSource: { type: String, default: "" },

    serviceId:      { type: Schema.Types.ObjectId, ref: "Service", default: null },
    preferredDate:  { type: String, required: true },
    preferredTime:  { type: String, enum: ["morning","afternoon","evening"], required: true },
    urgencyLevel:   { type: String, enum: ["normal","soon","urgent"], default: "normal" },
    notes:          { type: String, default: "", maxlength: 500 },

    confirmedDate:  { type: String, default: null },
    confirmedTime:  { type: String, default: null },

    status: {
      type:    String,
      enum:    ["pending","approved","rescheduled","rejected","cancelled","completed","no_show","expired"],
      default: "pending",
    },
    statusHistory: { type: [StatusHistorySchema], default: [] },
    adminNotes:    { type: String, default: "", maxlength: 1000 },

    reminderSent: {
      reminder24h: { type: Boolean, default: false },
      reminder2h:  { type: Boolean, default: false },
      followup:    { type: Boolean, default: false },
    },

    // Future-ready fields
    doctorId:      { type: Schema.Types.ObjectId, ref: "Doctor", default: null },
    slotId:        { type: String, default: null },
    paymentStatus: { type: String, enum: ["unpaid","paid","refunded",null], default: null },
    paymentRef:    { type: String, default: null },
  },
  { timestamps: true }
);

// ─── Indexes ─────────────────────────────────────────────────────────────────
AppointmentSchema.index({ clinicId: 1, status: 1, createdAt: -1 });   // Dashboard list
AppointmentSchema.index({ email: 1, status: 1 });                       // Duplicate check
AppointmentSchema.index({ confirmedDate: 1, status: 1 });               // Reminder cron
AppointmentSchema.index({ createdAt: 1, status: 1 });                   // Expiry cron
AppointmentSchema.index({ urgencyLevel: 1, status: 1 });                // Urgent filter
AppointmentSchema.index({ serviceId: 1 });                              // Service analytics
AppointmentSchema.index({ clinicId: 1, preferredDate: 1 });            // Daily digest

export const Appointment: Model<IAppointment> =
  mongoose.models.Appointment ??
  mongoose.model<IAppointment>("Appointment", AppointmentSchema);
