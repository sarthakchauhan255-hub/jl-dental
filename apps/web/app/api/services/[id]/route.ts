import { type NextRequest, type NextResponse } from "next/server";
import { requireSession }      from "@/lib/auth/session";
import { requirePermission }   from "@/lib/auth/rbac";
import { ok, noContent }       from "@/lib/api/responses";
import { handleRouteError }    from "@/lib/api/errors";
import { parseBody, parseObjectId } from "@/lib/api/validators";
import { NotFoundError }       from "@/lib/security/errors";
import { connectDB }           from "@/lib/db/connection";
import { Service }             from "@/models/Service";
import { serviceUpdateSchema } from "@/lib/validations";
import { invalidateCmsCache }  from "@/lib/cms/cache";
import { emitCmsAudit, diffRecords } from "@/lib/cms/audit";
import { scheduleMediaForCleanup, finalizeMediaOwnership } from "@/lib/media/cleanup";
import { SERVICE_CACHE }       from "@/features/services/config/services.config";
import { mapService }          from "@/lib/db/mappers";

export const dynamic = "force-dynamic";

export async function GET(_req: NextRequest, ctx: { params: Promise<{ id: string }> }): Promise<NextResponse> {
  try {
    const session = await requireSession();
    requirePermission(session.role, "services.read");
    const { id } = await ctx.params; parseObjectId(id);
    await connectDB();
    const raw = await Service.findById(id).lean();
    if (!raw) throw new NotFoundError("Service");
    return ok(mapService(raw));
  } catch (e) { return handleRouteError(e); }
}

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }): Promise<NextResponse> {
  try {
    const session = await requireSession();
    requirePermission(session.role, "services.update");
    const { id } = await ctx.params; parseObjectId(id);
    const body = await parseBody(req, serviceUpdateSchema);
    await connectDB();
    const rawBefore = await Service.findById(id).lean();
    if (!rawBefore) throw new NotFoundError("Service");
    const before = mapService(rawBefore);
    const rawUpdated = await Service.findByIdAndUpdate(id, { $set: body }, { new: true }).lean();
    if (!rawUpdated) throw new NotFoundError("Service");
    const updated = mapService(rawUpdated);
    if (updated.coverImage?.publicId && updated.coverImage.publicId !== before.coverImage?.publicId) {
      await finalizeMediaOwnership(updated.coverImage.publicId, "service", id);
      if (before.coverImage?.publicId) await scheduleMediaForCleanup(before.coverImage.publicId, "image_replaced", "service", id);
    }
    invalidateCmsCache(SERVICE_CACHE, "update");
    await emitCmsAudit({ actor: { id: session.userId, role: session.role }, action: "update", resource: "service", resourceId: id,
      changes: diffRecords(before, updated, ["coverImage"]) });
    return ok({ id: updated.id, name: updated.name });
  } catch (e) { return handleRouteError(e); }
}

export async function DELETE(_req: NextRequest, ctx: { params: Promise<{ id: string }> }): Promise<NextResponse> {
  try {
    const session = await requireSession();
    requirePermission(session.role, "services.delete");
    const { id } = await ctx.params; parseObjectId(id);
    await connectDB();
    const raw = await Service.findByIdAndDelete(id).lean();
    if (!raw) throw new NotFoundError("Service");
    const doc = mapService(raw);
    if (doc.coverImage?.publicId) await scheduleMediaForCleanup(doc.coverImage.publicId, "entity_deleted", "service", id);
    invalidateCmsCache(SERVICE_CACHE, "delete");
    await emitCmsAudit({ actor: { id: session.userId, role: session.role }, action: "delete", resource: "service", resourceId: id });
    return noContent();
  } catch (e) { return handleRouteError(e); }
}
