import { type NextRequest, type NextResponse } from "next/server";
import { requireSession }      from "@/lib/auth/session";
import { requirePermission }   from "@/lib/auth/rbac";
import { ok, paginated }       from "@/lib/api/responses";
import { handleRouteError }    from "@/lib/api/errors";
import { parsePagination }     from "@/lib/api/pagination";
import { parseBody }           from "@/lib/api/validators";
import { buildSearchFilter }   from "@/lib/api/query";
import { connectDB }           from "@/lib/db/connection";
import { Service }             from "@/models/Service";
import { serviceCreateSchema } from "@/lib/validations";
import { invalidateCmsCache }  from "@/lib/cms/cache";
import { emitCmsAudit }        from "@/lib/cms/audit";
import { generateSlug }        from "@/lib/cms/validation";
import { SERVICE_CACHE }       from "@/features/services/config/services.config";
import { mapService }          from "@/lib/db/mappers";
import { serializeObjectId }   from "@/lib/db/serializers";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    const session = await requireSession();
    requirePermission(session.role, "services.read");
    await connectDB();
    const { page, limit, skip } = parsePagination(req.nextUrl.searchParams);
    const q        = req.nextUrl.searchParams.get("q");
    const isActive = req.nextUrl.searchParams.get("isActive");
    const filter: Record<string, unknown> = {
      ...buildSearchFilter(q, ["name", "shortDesc"]),
      ...(isActive !== null ? { isActive: isActive === "true" } : {}),
    };
    const [docs, total] = await Promise.all([
      Service.find(filter).sort({ order: 1, name: 1 }).skip(skip).limit(limit).lean(),
      Service.countDocuments(filter),
    ]);
    return paginated(docs.map(mapService), page, limit, total);
  } catch (e) { return handleRouteError(e); }
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const session = await requireSession();
    requirePermission(session.role, "services.create");
    const body = await parseBody(req, serviceCreateSchema);
    if (!body.slug) (body as Record<string, unknown>).slug = generateSlug(body.name);
    await connectDB();
    const existing = await Service.exists({ slug: body.slug });
    if (existing) return handleRouteError(Object.assign(new Error("Slug exists"), { code: "CONFLICT", statusCode: 409 }));
    const svc = await Service.create(body);
    invalidateCmsCache(SERVICE_CACHE, "create");
    await emitCmsAudit({ actor: { id: session.userId, role: session.role }, action: "create", resource: "service", resourceId: serializeObjectId(svc._id) });
    return ok({ id: serializeObjectId(svc._id), slug: svc.slug }, 201);
  } catch (e) { return handleRouteError(e); }
}
