/**
 * AuditLog — content and admin action trail.
 * Tracks: creates, updates, deletes, status changes, exports.
 * Append-only. Powers the admin activity feed.
 */
import mongoose, { Schema, type Document, type Model } from "mongoose";

export type AuditAction =
  | "create"
  | "update"
  | "delete"
  | "status_change"
  | "publish"
  | "unpublish"
  | "approve"
  | "reject"
  | "export"
  | "media_upload"
  | "media_delete"
  | "clinic_config_update";

export type AuditResource =
  | "appointment"
  | "doctor"
  | "service"
  | "blog_post"
  | "gallery"
  | "faq"
  | "review"
  | "clinic"
  | "user"
  | "media";

export interface IAuditLog extends Document {
  clinicId:      mongoose.Types.ObjectId | null;
  userId:        mongoose.Types.ObjectId;
  userEmail:     string;             // Snapshot at time of action
  userRole:      string;
  action:        AuditAction;
  resource:      AuditResource;
  resourceId:    string;             // String to support various ID types
  resourceLabel: string;             // Human-readable: "Blog: How to brush teeth"
  previousValue: Record<string, unknown> | null;  // Before state (selective fields only)
  newValue:      Record<string, unknown> | null;  // After state (selective fields only)
  ip:            string;
  timestamp:     Date;
}

const AuditLogSchema = new Schema<IAuditLog>(
  {
    clinicId:      { type: Schema.Types.ObjectId, ref: "Clinic",   default: null },
    userId:        { type: Schema.Types.ObjectId, ref: "User",     required: true },
    userEmail:     { type: String, required: false, default: null },
    userRole:      { type: String, required: true },
    action:        {
      type: String,
      enum: [
        "create", "update", "delete", "status_change",
        "publish", "unpublish", "approve", "reject",
        "export", "media_upload", "media_delete", "clinic_config_update",
      ],
      required: true,
    },
    resource:      {
      type: String,
      enum: ["appointment", "doctor", "service", "blog_post", "gallery", "faq", "review", "clinic", "user", "media"],
      required: true,
    },
    resourceId:    { type: String, required: false, default: null },
    resourceLabel: { type: String, default: "" },
    previousValue: { type: Schema.Types.Mixed, default: null },
    newValue:      { type: Schema.Types.Mixed, default: null },
    ip:            { type: String, default: "unknown" },
    timestamp:     { type: Date, default: Date.now, immutable: true },
  },
  { timestamps: false }
);

AuditLogSchema.index({ clinicId: 1, timestamp: -1 });                 // Dashboard feed
AuditLogSchema.index({ userId: 1, timestamp: -1 });
AuditLogSchema.index({ resource: 1, resourceId: 1, timestamp: -1 });  // Per-entity history
AuditLogSchema.index({ action: 1, timestamp: -1 });
AuditLogSchema.index({ timestamp: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 90 }); // 90 day TTL

export const AuditLog: Model<IAuditLog> =
  mongoose.models.AuditLog ??
  mongoose.model<IAuditLog>("AuditLog", AuditLogSchema);
