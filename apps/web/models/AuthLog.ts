/**
 * AuthLog — security audit trail for authentication events.
 * Separate collection from business data for clean querying.
 * Append-only: never updated after insert.
 */
import mongoose, { Schema, type Document, type Model } from "mongoose";

export type AuthEvent =
  | "login_success"
  | "login_failed"
  | "logout"
  | "password_reset_requested"
  | "password_reset_completed"
  | "password_changed"
  | "role_changed"
  | "account_created"
  | "account_deactivated"
  | "lockout_triggered"
  | "token_refreshed";

export interface IAuthLog extends Document {
  userId:    mongoose.Types.ObjectId | null;  // null for failed logins (user not found)
  email:     string;
  event:     AuthEvent;
  success:   boolean;
  ip:        string;
  userAgent: string;
  meta:      Record<string, unknown>;        // e.g. { role: "admin" } for role changes
  timestamp: Date;
}

const AuthLogSchema = new Schema<IAuthLog>(
  {
    userId:    { type: Schema.Types.ObjectId, ref: "User", default: null },
    email:     { type: String, required: true, lowercase: true, trim: true },
    event:     {
      type: String,
      enum: [
        "login_success", "login_failed", "logout",
        "password_reset_requested", "password_reset_completed",
        "password_changed", "role_changed", "account_created",
        "account_deactivated", "lockout_triggered", "token_refreshed",
      ],
      required: true,
    },
    success:   { type: Boolean, required: true },
    ip:        { type: String, default: "unknown" },
    userAgent: { type: String, default: "" },
    meta:      { type: Schema.Types.Mixed, default: {} },
    timestamp: { type: Date, default: Date.now, immutable: true },
  },
  {
    timestamps: false,
    // Prevent accidental updates to audit logs
    strict: true,
  }
);

// Indexes for security monitoring queries
AuthLogSchema.index({ userId: 1, timestamp: -1 });
AuthLogSchema.index({ email: 1, event: 1, timestamp: -1 });
AuthLogSchema.index({ ip: 1, event: 1, timestamp: -1 });              // IP-based lockout detection
AuthLogSchema.index({ timestamp: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 90 }); // 90 day TTL

export const AuthLog: Model<IAuthLog> =
  mongoose.models.AuthLog ??
  mongoose.model<IAuthLog>("AuthLog", AuthLogSchema);
