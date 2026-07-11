import { type NextRequest, type NextResponse } from "next/server";
import { requireSession }     from "@/lib/auth/session";
import { requirePermission }  from "@/lib/auth/rbac";
import { ok, paginated }      from "@/lib/api/responses";
import { handleRouteError }   from "@/lib/api/errors";
import { parsePagination }    from "@/lib/api/pagination";
import { parseBody, parseObjectId } from "@/lib/api/validators";
import { NotFoundError }      from "@/lib/security/errors";
import { connectDB }          from "@/lib/db/connection";
import { Review }             from "@/models/Review";
import { invalidateCmsCache } from "@/lib/cms/cache";
import { emitCmsAudit }       from "@/lib/cms/audit";
import { REVIEW_CACHE }       from "@/features/reviews/config/reviews.config";
import { mapReview }          from "@/lib/db/mappers";
import { z }                  from "zod";

export const dynamic = "force-dynamic";

const moderateSchema = z.object({ status: z.enum(["pending", "approved", "rejected"]) });

export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    const session = await requireSession();
    requirePermission(session.role, "reviews.read");
    await connectDB();
    const { page, limit, skip } = parsePagination(req.nextUrl.searchParams);
    const status = req.nextUrl.searchParams.get("status") ?? "pending";
    const filter: Record<string, unknown> = status === "all" ? {} : { status };
    const [docs, total] = await Promise.all([
      Review.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Review.countDocuments(filter),
    ]);
    return paginated(docs.map(mapReview), page, limit, total);
  } catch (e) { return handleRouteError(e); }
}

export async function PATCH(req: NextRequest): Promise<NextResponse> {
  try {
    const session = await requireSession();
    requirePermission(session.role, "reviews.update");
    const id = req.nextUrl.searchParams.get("id") ?? "";
    parseObjectId(id);
    const body = await parseBody(req, moderateSchema);
    await connectDB();
    const rawBefore = await Review.findById(id).lean();
    if (!rawBefore) throw new NotFoundError("Review");
    const before = mapReview(rawBefore);
    const rawUpdated = await Review.findByIdAndUpdate(id, { $set: { status: body.status } }, { new: true }).lean();
    if (!rawUpdated) throw new NotFoundError("Review");
    invalidateCmsCache(REVIEW_CACHE, body.status === "approved" ? "publish" : "update");
    await emitCmsAudit({ actor: { id: session.userId, role: session.role }, action: "update", resource: "review", resourceId: id,
      meta: { previousStatus: before.status, newStatus: body.status } });
    return ok({ id });
  } catch (e) { return handleRouteError(e); }
}
