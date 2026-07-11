/**
 * Media Lifecycle — ownership finalization + reference-protected cleanup.
 *
 * CASES:
 *  A. upload + save succeeds        → finalizeMediaOwnership() removes abandoned_upload marker
 *  B. upload + save fails           → abandoned_upload marker remains, eligible for Phase 7 cron
 *  C. media replaced                → scheduleMediaForCleanup("image_replaced") — reference-checked
 *  D. resource deleted              → scheduleMediaForCleanup("entity_deleted") — reference-checked
 *  E. asset referenced elsewhere    → isMediaReferenced() blocks destructive scheduling
 *
 * SAFETY:
 *  - Never deletes from Cloudinary directly; only manages the cleanup queue.
 *  - Failures are logged and never roll back the parent mutation.
 *  - Reference check is centralized HERE — resource services never duplicate it.
 */
import { logger } from "@/lib/logger";

/**
 * Approved resource fields capable of referencing a Cloudinary publicId.
 * Kept in one place so adding a media-bearing resource means one edit.
 */
const MEDIA_REFERENCE_FIELDS = [
  { model: "Doctor",   fields: ["photo.publicId"] },
  { model: "Service",  fields: ["coverImage.publicId"] },
  { model: "BlogPost", fields: ["coverImage.publicId"] },
  { model: "Gallery",  fields: ["before.publicId", "after.publicId", "image.publicId"] },
  { model: "Clinic",   fields: ["logo.publicId", "homepage.hero.image.publicId"] },
] as const;

/**
 * Case E core: is this publicId still referenced by any live resource?
 * `excludeResourceId` lets the caller ignore the resource that is being
 * mutated/deleted (its own reference is expected and irrelevant).
 */
export async function isMediaReferenced(
  publicId: string,
  exclude?: { resource: string; resourceId: string },
): Promise<boolean> {
  const mongoose = (await import("mongoose")).default;
  for (const ref of MEDIA_REFERENCE_FIELDS) {
    const model = mongoose.models[ref.model];
    if (!model) continue;
    const or = ref.fields.map(f => ({ [f]: publicId }));
    const query: Record<string, unknown> = { $or: or };
    if (exclude && modelMatchesResource(ref.model, exclude.resource)) {
      query._id = { $ne: exclude.resourceId };
    }
    const exists = await model.exists(query);
    if (exists) return true;
  }
  return false;
}

function modelMatchesResource(model: string, resource: string): boolean {
  const map: Record<string, string> = {
    doctor: "Doctor", service: "Service", blog_post: "BlogPost",
    gallery: "Gallery", clinic: "Clinic",
  };
  return map[resource] === model;
}

/** Case A: entity saved with a new publicId — asset is now owned. */
export async function finalizeMediaOwnership(
  publicId: string, resource: string, resourceId: string,
): Promise<void> {
  try {
    const { MediaPendingCleanup } = await import("@/models/MediaPendingCleanup");
    await MediaPendingCleanup.deleteOne({ publicId, reason: "abandoned_upload" });
    logger.debug("[MediaCleanup] Finalized ownership", { publicId, resource, resourceId });
  } catch (err: unknown) {
    logger.warn("[MediaCleanup] finalizeMediaOwnership failed (non-blocking)", {
      publicId, resource, resourceId, err: String(err),
    });
  }
}

/**
 * Cases C/D with Case E protection:
 * schedule destructive cleanup ONLY if no other live resource references the asset.
 */
export async function scheduleMediaForCleanup(
  publicId: string,
  reason: "entity_deleted" | "image_replaced",
  resource?: string,
  resourceId?: string,
): Promise<{ scheduled: boolean; reason?: string }> {
  try {
    // Case E: reference protection
    const referenced = await isMediaReferenced(
      publicId,
      resource && resourceId ? { resource, resourceId } : undefined,
    );
    if (referenced) {
      logger.info("[MediaCleanup] Skipped — asset still referenced", { publicId, reason });
      return { scheduled: false, reason: "still_referenced" };
    }

    const { MediaPendingCleanup } = await import("@/models/MediaPendingCleanup");
    await MediaPendingCleanup.findOneAndUpdate(
      { publicId },
      { $set: { status: "pending", reason, resource, resourceId, updatedAt: new Date() } },
      { upsert: true },
    );
    logger.debug("[MediaCleanup] Scheduled cleanup", { publicId, reason });
    return { scheduled: true };
  } catch (err: unknown) {
    logger.warn("[MediaCleanup] scheduleMediaForCleanup failed (non-blocking)", {
      publicId, reason, err: String(err),
    });
    return { scheduled: false, reason: "error" };
  }
}
