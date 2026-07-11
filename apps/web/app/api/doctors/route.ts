import { type NextRequest, type NextResponse } from "next/server";
import { requireSession }     from "@/lib/auth/session";
import { requirePermission }  from "@/lib/auth/rbac";
import { ok, paginated }      from "@/lib/api/responses";
import { handleRouteError }   from "@/lib/api/errors";
import { parsePagination }    from "@/lib/api/pagination";
import { parseBody }          from "@/lib/api/validators";
import { buildSearchFilter }  from "@/lib/api/query";
import { connectDB }          from "@/lib/db/connection";
import { Doctor }             from "@/models/Doctor";
import { doctorCreateSchema } from "@/lib/validations";
import { invalidateCmsCache } from "@/lib/cms/cache";
import { emitCmsAudit }       from "@/lib/cms/audit";
import { DOCTOR_CACHE }       from "@/features/doctors/config/doctors.config";
import { generateSlug }       from "@/lib/cms/validation";
import { mapDoctor }          from "@/lib/db/mappers";
import { serializeObjectId }  from "@/lib/db/serializers";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    const session = await requireSession();
    requirePermission(session.role, "doctors.read");
    await connectDB();
    const { page, limit, skip } = parsePagination(req.nextUrl.searchParams);
    const q        = req.nextUrl.searchParams.get("q");
    const isActive = req.nextUrl.searchParams.get("isActive");
    const filter: Record<string, unknown> = {
      ...buildSearchFilter(q, ["name", "specialization"]),
      ...(isActive !== null ? { isActive: isActive === "true" } : {}),
    };
    const [docs, total] = await Promise.all([
      Doctor.find(filter).sort({ order: 1, name: 1 }).skip(skip).limit(limit).lean(),
      Doctor.countDocuments(filter),
    ]);
    return paginated(docs.map(mapDoctor), page, limit, total);
  } catch (e) { return handleRouteError(e); }
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const session = await requireSession();
    requirePermission(session.role, "doctors.create");
    const body = await parseBody(req, doctorCreateSchema);
    if (!body.slug) (body as Record<string, unknown>).slug = generateSlug(body.name);
    await connectDB();
    const existing = await Doctor.exists({ slug: body.slug });
    if (existing) return handleRouteError(Object.assign(new Error("Slug already exists"), { code: "CONFLICT", statusCode: 409 }));
    const doctor = await Doctor.create(body);
    invalidateCmsCache(DOCTOR_CACHE, "create");
    await emitCmsAudit({ actor: { id: session.userId, role: session.role }, action: "create", resource: "doctor", resourceId: serializeObjectId(doctor._id) });
    return ok({ id: serializeObjectId(doctor._id), slug: doctor.slug }, 201);
  } catch (e) { return handleRouteError(e); }
}
