/**
 * PasswordResetToken — secure single-use reset tokens.
 * Token stored as bcrypt hash — original never persisted.
 * TTL index auto-expires after 1 hour.
 */
import mongoose, { Schema, type Document, type Model } from "mongoose";

export interface IPasswordResetToken extends Document {
  userId:    mongoose.Types.ObjectId;
  tokenHash: string;         // bcrypt hash of the raw token
  expiresAt: Date;
  used:      boolean;
  usedAt:    Date | null;
  createdAt: Date;
}

const PasswordResetTokenSchema = new Schema<IPasswordResetToken>(
  {
    userId:    { type: Schema.Types.ObjectId, ref: "User", required: true },
    tokenHash: { type: String, required: true },
    expiresAt: { type: Date, required: true },
    used:      { type: Boolean, default: false },
    usedAt:    { type: Date, default: null },
  },
  { timestamps: true }
);

// TTL: auto-delete expired tokens
PasswordResetTokenSchema.index(
  { expiresAt: 1 },
  { expireAfterSeconds: 0 } // expires at the expiresAt date exactly
);
PasswordResetTokenSchema.index({ userId: 1 });
PasswordResetTokenSchema.index({ tokenHash: 1 });

export const PasswordResetToken: Model<IPasswordResetToken> =
  mongoose.models.PasswordResetToken ??
  mongoose.model<IPasswordResetToken>("PasswordResetToken", PasswordResetTokenSchema);
