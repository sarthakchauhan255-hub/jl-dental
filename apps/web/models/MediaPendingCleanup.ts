/**
 * MediaPendingCleanup — tracks Cloudinary assets requiring eventual deletion.
 *
 * Architecture only — no worker/cron execution in this phase (Phase 7 delivers
 * the cron). This model defines the complete state machine and storage contract
 * that the future cleanup worker will operate against.
 *
 * An asset enters this collection when:
 * - Upload succeeds but the owning form/entity save is abandoned
 * - Entity save fails after a successful Cloudinary upload
 * - An image is replaced (old asset queued for deletion)
 * - Entity is deleted (associated media queued for deletion)
 *
 * State machine:
 *
 *   pending ──────► retrying ──────► cleaned
 *      │                │
 *      │                └────────► failed (after maxAttempts exhausted)
 *      │
 *      └──────────────────────────► cleaned (direct success, no retry needed)
 *
 * Transition rules (enforced by future worker, documented here as contract):
 * - pending  → retrying  : first deletion attempt fails
 * - pending  → cleaned   : first deletion attempt succeeds
 * - retrying → retrying  : subsequent attempt fails, attempts < maxAttempts
 * - retrying → cleaned   : subsequent attempt succeeds
 * - retrying → failed    : attempts >= maxAttempts (permanently_failed equivalent)
 * - failed   → retrying  : manual admin-triggered retry (resets attempt count)
 *
 * Terminal states: cleaned, failed (failed is terminal until manual intervention)
 */
import mongoose, { Schema, type Document, type Model } from "mongoose";

export type CleanupStatus = "pending" | "retrying" | "cleaned" | "failed";

export const CLEANUP_MAX_ATTEMPTS = 3;

/** Valid state transitions — used by future worker to guard against invalid moves. */
export const CLEANUP_TRANSITIONS: Record<CleanupStatus, CleanupStatus[]> = {
  pending:  ["retrying", "cleaned"],
  retrying: ["retrying", "cleaned", "failed"],
  cleaned:  [],                 // terminal
  failed:   ["retrying"],       // manual retry only
};

export function isValidCleanupTransition(from: CleanupStatus, to: CleanupStatus): boolean {
  return CLEANUP_TRANSITIONS[from].includes(to);
}

export interface IMediaPendingCleanup extends Document {
  publicId:     string;
  folder:       string;
  uploadedBy:   mongoose.Types.ObjectId | null;
  uploadedAt:   Date;

  // ─── State machine ──────────────────────────────────────────────────────
  status:       CleanupStatus;
  retryCount:   number;
  maxAttempts:  number;
  lastAttemptAt: Date | null;
  nextRetryAt:  Date | null;

  // ─── Cleanup metadata ───────────────────────────────────────────────────
  /** Why this asset was queued — aids debugging and admin review */
  reason:       "abandoned_upload" | "entity_save_failed" | "image_replaced" | "entity_deleted";
  /** Last error message from a failed deletion attempt */
  lastError:    string | null;
  /** Entity that referenced this media, if known (for context, not enforcement) */
  relatedResource:   string | null;
  relatedResourceId: string | null;

  resolvedAt:   Date | null;
  createdAt:    Date;
  updatedAt:    Date;
}

const MediaPendingCleanupSchema = new Schema<IMediaPendingCleanup>(
  {
    publicId:   { type: String, required: true, unique: true },
    folder:     { type: String, default: "" },
    uploadedBy: { type: Schema.Types.ObjectId, ref: "User", default: null },
    uploadedAt: { type: Date, default: Date.now },

    status:        { type: String, enum: ["pending", "retrying", "cleaned", "failed"], default: "pending" },
    retryCount:    { type: Number, default: 0 },
    maxAttempts:   { type: Number, default: 3 },
    lastAttemptAt: { type: Date, default: null },
    nextRetryAt:   { type: Date, default: null },

    reason: {
      type:    String,
      enum:    ["abandoned_upload", "entity_save_failed", "image_replaced", "entity_deleted"],
      default: "abandoned_upload",
    },
    lastError:         { type: String, default: null },
    relatedResource:   { type: String, default: null },
    relatedResourceId: { type: String, default: null },

    resolvedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

// Safety-net TTL — auto-purge document after 7 days regardless of status.
// Cleanup worker should resolve well before this; this prevents indefinite growth.
MediaPendingCleanupSchema.index(
  { createdAt: 1 },
  { expireAfterSeconds: 60 * 60 * 24 * 7 }
);

// Worker query pattern: find actionable items
MediaPendingCleanupSchema.index({ status: 1, nextRetryAt: 1 });
MediaPendingCleanupSchema.index({ status: 1, uploadedAt: 1 });

export const MediaPendingCleanup: Model<IMediaPendingCleanup> =
  mongoose.models.MediaPendingCleanup ??
  mongoose.model<IMediaPendingCleanup>("MediaPendingCleanup", MediaPendingCleanupSchema);
