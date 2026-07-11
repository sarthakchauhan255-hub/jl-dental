/**
 * User model — admin accounts only in v1.
 * tokenVersion: increment to invalidate all active sessions for a user.
 * passwordHash never returned in queries (toJSON transform).
 */
import mongoose, { Schema, type Document, type Model } from "mongoose";
import type { UserRole } from "@/types/auth";

export interface IUser extends Document {
  clinicId:      mongoose.Types.ObjectId | null;
  name:          string;
  email:         string;
  passwordHash:  string;
  role:          UserRole;
  isActive:      boolean;
  // ─── Session control ─────────────────────────────────────────────────
  tokenVersion:  number;             // Increment to invalidate all sessions
  // ─── 2FA (schema-ready, v2 implementation) ───────────────────────────
  twoFactorEnabled: boolean;
  twoFactorSecret:  string | null;
  // ─── OAuth (schema-ready, v2 implementation) ─────────────────────────
  authProvider:  "local" | "google"; // Extensible for OAuth
  // ─── Timestamps ───────────────────────────────────────────────────────
  lastLoginAt:   Date | null;
  createdAt:     Date;
  updatedAt:     Date;
}

const UserSchema = new Schema<IUser>(
  {
    clinicId:         { type: Schema.Types.ObjectId, ref: "Clinic", default: null },
    name:             { type: String, required: true, trim: true, maxlength: 100 },
    email:            { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash:     { type: String, required: true },
    role:             {
      type:    String,
      enum:    ["superadmin", "admin", "receptionist", "content_manager", "doctor"],
      default: "admin",
    },
    isActive:         { type: Boolean, default: true },
    tokenVersion:     { type: Number, default: 0 },
    twoFactorEnabled: { type: Boolean, default: false },
    twoFactorSecret:  { type: String, default: null },
    authProvider:     { type: String, enum: ["local", "google"], default: "local" },
    lastLoginAt:      { type: Date, default: null },
  },
  { timestamps: true }
);

UserSchema.index({ email: 1 }, { unique: true });
UserSchema.index({ clinicId: 1, role: 1 });
UserSchema.index({ isActive: 1, role: 1 });

// Never leak passwordHash or 2FA secret to API responses
UserSchema.set("toJSON", {
  transform: (_doc, ret) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const r = ret as any;
    delete r.passwordHash;
    delete r.twoFactorSecret;
    return ret;
  },
});

export const User: Model<IUser> =
  mongoose.models.User ?? mongoose.model<IUser>("User", UserSchema);
