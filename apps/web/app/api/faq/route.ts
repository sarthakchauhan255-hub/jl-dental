import { type NextRequest, type NextResponse } from "next/server";
import { requireSession }     from "@/lib/auth/session";
import { requirePermission }  from "@/lib/auth/rbac";
import { ok, paginated }      from "@/lib/api/responses";
import { handleRouteError }   from "@/lib/api/errors";
import { parsePagination }    from "@/lib/api/pagination";
import { parseBody }          from "@/lib/api/validators";
import { connectDB }          from "@/lib/db/connection";
import { FAQ }                from "@/models/FAQ";
import { faqCreateSchema }    from "@/lib/validations";
import { invalidateCmsCache } from "@/lib/cms/cache";
import { emitCmsAudit }       from "@/lib/cms/audit";
import { FAQ_CACHE }          from "@/features/faq/config/faq.config";
import { mapFaq }             from "@/lib/db/mappers";
import { serializeObjectId }  from "@/lib/db/serializers";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    const session = await requireSession();
    requirePermission(session.role, "faq.read");
    await connectDB();
    const { page, limit, skip } = parsePagination(req.nextUrl.searchParams);
    const [docs, total] = await Promise.all([
      FAQ.find().sort({ order: 1 }).skip(skip).limit(limit).lean(),
      FAQ.countDocuments(),
    ]);
    return paginated(docs.map(mapFaq), page, limit, total);
  } catch (e) { return handleRouteError(e); }
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const session = await requireSession();
    requirePermission(session.role, "faq.create");
    const body = await parseBody(req, faqCreateSchema);
    await connectDB();
    const faq = await FAQ.create(body);
    invalidateCmsCache(FAQ_CACHE, "create");
    await emitCmsAudit({ actor: { id: session.userId, role: session.role }, action: "create", resource: "faq", resourceId: serializeObjectId(faq._id) });
    return ok({ id: serializeObjectId(faq._id) }, 201);
  } catch (e) { return handleRouteError(e); }
}
