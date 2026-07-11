/**
 * NotificationLog — tracks every notification send attempt.
 * Supports retry architecture: attemptCount + nextRetryAt.
 * Admin can view delivery status and trigger manual retries.
 */
import mongoose, { Schema, type Document, type Model } from "mongoose";
import type { NotificationChannel, NotificationStatus } from "@/types";

export interface INotificationLog extends Document {
  clinicId:     mongoose.Types.ObjectId | null;
  // ─── Routing ──────────────────────────────────────────────────────────
  type:         NotificationChannel;
  recipient:    string;              // email address or phone number
  subject:      string;
  // ─── Status & retry ───────────────────────────────────────────────────
  status:       NotificationStatus;
  attemptCount: number;
  lastAttemptAt: Date | null;
  nextRetryAt:  Date | null;
  error:        string | null;
  // ─── Template ─────────────────────────────────────────────────────────
  templateKey:  string;             // e.g. "patient_booking_approved"
  // ─── Reference ────────────────────────────────────────────────────────
  appointmentId: mongoose.Types.ObjectId | null;
  // ─── Timestamps ───────────────────────────────────────────────────────
  sentAt:       Date;
  meta:         Record<string, unknown>;
}

const NotificationLogSchema = new Schema<INotificationLog>(
  {
    clinicId:      { type: Schema.Types.ObjectId, ref: "Clinic",      default: null },
    type:          { type: String, enum: ["email", "whatsapp", "sms"], required: true },
    recipient:     { type: String, required: true, trim: true },
    subject:       { type: String, default: "" },
    status:        {
      type:     String,
      enum:     ["sent", "failed", "permanently_failed"],
      required: true,
    },
    attemptCount:  { type: Number, default: 1 },
    lastAttemptAt: { type: Date, default: null },
    nextRetryAt:   { type: Date, default: null },
    error:         { type: String, default: null },
    templateKey:   { type: String, default: "" },
    appointmentId: { type: Schema.Types.ObjectId, ref: "Appointment", default: null },
    sentAt:        { type: Date, default: Date.now },
    meta:          { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: false } // sentAt is the timestamp
);

NotificationLogSchema.index({ clinicId: 1, type: 1, sentAt: -1 });
NotificationLogSchema.index({ status: 1, nextRetryAt: 1 });           // Retry cron
NotificationLogSchema.index({ appointmentId: 1 });                     // Per-appointment history
NotificationLogSchema.index({ sentAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 180 }); // 180 day TTL

export const NotificationLog: Model<INotificationLog> =
  mongoose.models.NotificationLog ??
  mongoose.model<INotificationLog>("NotificationLog", NotificationLogSchema);
