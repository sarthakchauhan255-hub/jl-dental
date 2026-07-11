import { type NextRequest, type NextResponse } from "next/server";
import { requireSession }     from "@/lib/auth/session";
import { requirePermission }  from "@/lib/auth/rbac";
import { ok, noContent }      from "@/lib/api/responses";
import { handleRouteError }   from "@/lib/api/errors";
import { parseBody, parseObjectId } from "@/lib/api/validators";
import { NotFoundError }      from "@/lib/security/errors";
import { connectDB }          from "@/lib/db/connection";
import { Doctor }             from "@/models/Doctor";
import { doctorUpdateSchema } from "@/lib/validations";
import { invalidateCmsCache } from "@/lib/cms/cache";
import { emitCmsAudit, diffRecords } from "@/lib/cms/audit";
import { DOCTOR_CACHE }       from "@/features/doctors/config/doctors.config";
import { finalizeMediaOwnership, scheduleMediaForCleanup } from "@/lib/media/cleanup";
import { mapDoctor }          from "@/lib/db/mappers";

export const dynamic = "force-dynamic";

export async function GET(_req: NextRequest, ctx: { params: Promise<{ id: string }> }): Promise<NextResponse> {
  try {
    const session = await requireSession();
    requirePermission(session.role, "doctors.read");
    const { id } = await ctx.params; parseObjectId(id);
    await connectDB();
    const raw = await Doctor.findById(id).lean();
    if (!raw) throw new NotFoundError("Doctor");
    return ok(mapDoctor(raw));
  } catch (e) { return handleRouteError(e); }
}

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }): Promise<NextResponse> {
  try {
    const session = await requireSession();
    requirePermission(session.role, "doctors.update");
    const { id } = await ctx.params; parseObjectId(id);
    const body = await parseBody(req, doctorUpdateSchema);
    await connectDB();

    const rawBefore = await Doctor.findById(id).lean();
    if (!rawBefore) throw new NotFoundError("Doctor");
    const before = mapDoctor(rawBefore);

    const rawUpdated = await Doctor.findByIdAndUpdate(id, { $set: body }, { new: true }).lean();
    if (!rawUpdated) throw new NotFoundError("Doctor");
    const updated = mapDoctor(rawUpdated);

    // Media ownership: finalize new photo, schedule old for cleanup (reference-checked)
    if (updated.photo?.publicId && updated.photo.publicId !== before.photo?.publicId) {
      await finalizeMediaOwnership(updated.photo.publicId, "doctor", id);
      if (before.photo?.publicId) {
        await scheduleMediaForCleanup(before.photo.publicId, "image_replaced", "doctor", id);
      }
    }

    invalidateCmsCache(DOCTOR_CACHE, "update");
    await emitCmsAudit({
      actor: { id: session.userId, role: session.role }, action: "update",
      resource: "doctor", resourceId: id,
      changes: diffRecords(before, updated, ["photo"]),
    });
    return ok({ id: updated.id, name: updated.name });
  } catch (e) { return handleRouteError(e); }
}

export async function DELETE(_req: NextRequest, ctx: { params: Promise<{ id: string }> }): Promise<NextResponse> {
  try {
    const session = await requireSession();
    requirePermission(session.role, "doctors.delete");
    const { id } = await ctx.params; parseObjectId(id);
    await connectDB();
    const raw = await Doctor.findByIdAndDelete(id).lean();
    if (!raw) throw new NotFoundError("Doctor");
    const doc = mapDoctor(raw);
    if (doc.photo?.publicId) {
      await scheduleMediaForCleanup(doc.photo.publicId, "entity_deleted", "doctor", id);
    }
    invalidateCmsCache(DOCTOR_CACHE, "delete");
    await emitCmsAudit({ actor: { id: session.userId, role: session.role }, action: "delete", resource: "doctor", resourceId: id });
    return noContent();
  } catch (e) { return handleRouteError(e); }
}
