import { type NextRequest, type NextResponse } from "next/server";
import { requireSession }          from "@/lib/auth/session";
import { requirePermission }       from "@/lib/auth/rbac";
import { ok, noContent }           from "@/lib/api/responses";
import { handleRouteError }        from "@/lib/api/errors";
import { parseBody, parseObjectId } from "@/lib/api/validators";
import { NotFoundError }           from "@/lib/security/errors";
import { connectDB }               from "@/lib/db/connection";
import { Gallery }                 from "@/models/Gallery";
import { galleryItemUpdateSchema } from "@/lib/validations";
import { invalidateCmsCache }      from "@/lib/cms/cache";
import { emitCmsAudit }            from "@/lib/cms/audit";
import { scheduleMediaForCleanup, finalizeMediaOwnership } from "@/lib/media/cleanup";
import { GALLERY_CACHE }           from "@/features/gallery/config/gallery.config";
import { mapGallery }              from "@/lib/db/mappers";

export const dynamic = "force-dynamic";

export async function GET(_req: NextRequest, ctx: { params: Promise<{ id: string }> }): Promise<NextResponse> {
  try {
    const session = await requireSession();
    requirePermission(session.role, "gallery.read");
    const { id } = await ctx.params; parseObjectId(id);
    await connectDB();
    const raw = await Gallery.findById(id).lean();
    if (!raw) throw new NotFoundError("Gallery item");
    return ok(mapGallery(raw));
  } catch (e) { return handleRouteError(e); }
}

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }): Promise<NextResponse> {
  try {
    const session = await requireSession();
    requirePermission(session.role, "gallery.update");
    const { id } = await ctx.params; parseObjectId(id);
    const body = await parseBody(req, galleryItemUpdateSchema);
    await connectDB();
    const rawBefore = await Gallery.findById(id).lean();
    if (!rawBefore) throw new NotFoundError("Gallery item");
    const before = mapGallery(rawBefore);
    const rawUpdated = await Gallery.findByIdAndUpdate(id, { $set: body }, { new: true }).lean();
    if (!rawUpdated) throw new NotFoundError("Gallery item");
    const updated = mapGallery(rawUpdated);

    for (const field of ["before", "after", "image"] as const) {
      const newAsset = updated[field];
      const oldAsset = before[field];
      if (newAsset?.publicId && newAsset.publicId !== oldAsset?.publicId) {
        await finalizeMediaOwnership(newAsset.publicId, "gallery", id);
        if (oldAsset?.publicId) await scheduleMediaForCleanup(oldAsset.publicId, "image_replaced", "gallery", id);
      }
    }

    invalidateCmsCache(GALLERY_CACHE, "update");
    await emitCmsAudit({ actor: { id: session.userId, role: session.role }, action: "update", resource: "gallery_item", resourceId: id });
    return ok({ id: updated.id });
  } catch (e) { return handleRouteError(e); }
}

export async function DELETE(_req: NextRequest, ctx: { params: Promise<{ id: string }> }): Promise<NextResponse> {
  try {
    const session = await requireSession();
    requirePermission(session.role, "gallery.delete");
    const { id } = await ctx.params; parseObjectId(id);
    await connectDB();
    const raw = await Gallery.findByIdAndDelete(id).lean();
    if (!raw) throw new NotFoundError("Gallery item");
    const doc = mapGallery(raw);
    for (const field of ["before", "after", "image"] as const) {
      const asset = doc[field];
      if (asset?.publicId) await scheduleMediaForCleanup(asset.publicId, "entity_deleted", "gallery", id);
    }
    invalidateCmsCache(GALLERY_CACHE, "delete");
    await emitCmsAudit({ actor: { id: session.userId, role: session.role }, action: "delete", resource: "gallery_item", resourceId: id });
    return noContent();
  } catch (e) { return handleRouteError(e); }
}
