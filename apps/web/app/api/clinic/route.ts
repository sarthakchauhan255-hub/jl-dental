import { type NextRequest, type NextResponse } from "next/server";
import { requireSession }     from "@/lib/auth/session";
import { requirePermission }  from "@/lib/auth/rbac";
import { ok }                 from "@/lib/api/responses";
import { handleRouteError }   from "@/lib/api/errors";
import { parseBody }          from "@/lib/api/validators";
import { connectDB }          from "@/lib/db/connection";
import { Clinic }             from "@/models/Clinic";
import { clinicUpdateSchema } from "@/lib/validations";
import { invalidateCmsCache } from "@/lib/cms/cache";
import { emitCmsAudit, diffRecords } from "@/lib/cms/audit";
import { finalizeMediaOwnership, scheduleMediaForCleanup } from "@/lib/media/cleanup";
import { TECH }               from "@/config/technical";
import { CACHE_TAGS }         from "@/lib/cache";
import { mapClinic }          from "@/lib/db/mappers";

export const dynamic = "force-dynamic";

const CLINIC_CACHE = { tags: [CACHE_TAGS.clinic, CACHE_TAGS.homepage] };

export async function GET(_req: NextRequest): Promise<NextResponse> {
  try {
    const session = await requireSession();
    requirePermission(session.role, "clinic.read");
    await connectDB();
    const raw = await Clinic.findOne({ slug: TECH.DEFAULT_CLINIC_SLUG }).lean();
    if (!raw) return ok(null);
    return ok(mapClinic(raw));
  } catch (e) { return handleRouteError(e); }
}

export async function PATCH(req: NextRequest): Promise<NextResponse> {
  try {
    const session = await requireSession();
    requirePermission(session.role, "clinic.update");
    const body = await parseBody(req, clinicUpdateSchema);
    await connectDB();
    const rawBefore = await Clinic.findOne({ slug: TECH.DEFAULT_CLINIC_SLUG }).lean();
    if (!rawBefore) return handleRouteError(Object.assign(new Error("Clinic not found"), { statusCode: 404 }));
    const before = mapClinic(rawBefore);
    const rawUpdated = await Clinic.findOneAndUpdate(
      { slug: TECH.DEFAULT_CLINIC_SLUG }, { $set: body }, { new: true }
    ).lean();
    if (!rawUpdated) return handleRouteError(Object.assign(new Error("Clinic not found"), { statusCode: 404 }));
    const updated = mapClinic(rawUpdated);

    // Logo ownership lifecycle — reference-checked cleanup
    if (updated.logo?.publicId && updated.logo.publicId !== before.logo?.publicId) {
      await finalizeMediaOwnership(updated.logo.publicId, "clinic", before.id);
      if (before.logo?.publicId) {
        await scheduleMediaForCleanup(before.logo.publicId, "image_replaced", "clinic", before.id);
      }
    }

    // Hero image lifecycle — same contract as logo
    const heroImg = (id: Record<string, unknown> | null | undefined) =>
      ((id?.homepage as Record<string, unknown> | undefined)?.hero as Record<string, unknown> | undefined)?.image as { publicId?: string } | null | undefined;
    const newHero = heroImg(updated);
    const oldHero = heroImg(before);
    if (newHero?.publicId && newHero.publicId !== oldHero?.publicId) {
      await finalizeMediaOwnership(newHero.publicId, "clinic", before.id);
      if (oldHero?.publicId) {
        await scheduleMediaForCleanup(oldHero.publicId, "image_replaced", "clinic", before.id);
      }
    }

    invalidateCmsCache(CLINIC_CACHE, "update");
    await emitCmsAudit({ actor: { id: session.userId, role: session.role }, action: "update",
      resource: "clinic", resourceId: before.id,
      changes: diffRecords(before, updated, ["logo", "workingHours"]) });
    return ok({ id: updated.id, name: updated.name });
  } catch (e) { return handleRouteError(e); }
}
