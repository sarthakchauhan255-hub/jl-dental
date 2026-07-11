import { type NextRequest, type NextResponse } from "next/server";
import { requireSession }          from "@/lib/auth/session";
import { requirePermission }       from "@/lib/auth/rbac";
import { ok, paginated }           from "@/lib/api/responses";
import { handleRouteError }        from "@/lib/api/errors";
import { parsePagination }         from "@/lib/api/pagination";
import { parseBody }               from "@/lib/api/validators";
import { connectDB }               from "@/lib/db/connection";
import { Gallery }                 from "@/models/Gallery";
import { galleryItemCreateSchema } from "@/lib/validations";
import { invalidateCmsCache }      from "@/lib/cms/cache";
import { emitCmsAudit }            from "@/lib/cms/audit";
import { finalizeMediaOwnership }  from "@/lib/media/cleanup";
import { GALLERY_CACHE }           from "@/features/gallery/config/gallery.config";
import { mapGallery }              from "@/lib/db/mappers";
import { serializeObjectId }       from "@/lib/db/serializers";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    const session = await requireSession();
    requirePermission(session.role, "gallery.read");
    await connectDB();
    const { page, limit, skip } = parsePagination(req.nextUrl.searchParams);
    const type = req.nextUrl.searchParams.get("type");
    const filter: Record<string, unknown> = type ? { type } : {};
    const [docs, total] = await Promise.all([
      Gallery.find(filter).sort({ order: 1 }).skip(skip).limit(limit).lean(),
      Gallery.countDocuments(filter),
    ]);
    return paginated(docs.map(mapGallery), page, limit, total);
  } catch (e) { return handleRouteError(e); }
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const session = await requireSession();
    requirePermission(session.role, "gallery.create");
    const body = await parseBody(req, galleryItemCreateSchema);
    const b = body as Record<string, unknown>;

    // Before/after pair integrity — server-enforced
    if (b.type === "before_after" && (!b.before || !b.after)) {
      return handleRouteError(Object.assign(
        new Error("Before/After items require both images."),
        { code: "VALIDATION_ERROR", statusCode: 422,
          fields: { before: "Required for before/after items", after: "Required for before/after items" } }
      ));
    }
    if (b.type === "general" && !b.image) {
      return handleRouteError(Object.assign(
        new Error("General gallery items require an image."),
        { code: "VALIDATION_ERROR", statusCode: 422, fields: { image: "Required" } }
      ));
    }

    await connectDB();
    const item = await Gallery.create(body);
    const id = serializeObjectId(item._id);

    // Finalize ownership for all attached assets
    for (const field of ["before", "after", "image"] as const) {
      const asset = b[field] as { publicId?: string } | null | undefined;
      if (asset?.publicId) await finalizeMediaOwnership(asset.publicId, "gallery", id);
    }

    invalidateCmsCache(GALLERY_CACHE, "create");
    await emitCmsAudit({ actor: { id: session.userId, role: session.role }, action: "create", resource: "gallery_item", resourceId: id });
    return ok({ id }, 201);
  } catch (e) { return handleRouteError(e); }
}
