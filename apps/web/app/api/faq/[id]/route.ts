import { type NextRequest, type NextResponse } from "next/server";
import { requireSession }     from "@/lib/auth/session";
import { requirePermission }  from "@/lib/auth/rbac";
import { ok, noContent }      from "@/lib/api/responses";
import { handleRouteError }   from "@/lib/api/errors";
import { parseBody, parseObjectId } from "@/lib/api/validators";
import { NotFoundError }      from "@/lib/security/errors";
import { connectDB }          from "@/lib/db/connection";
import { FAQ }                from "@/models/FAQ";
import { faqUpdateSchema }    from "@/lib/validations";
import { invalidateCmsCache } from "@/lib/cms/cache";
import { emitCmsAudit, diffRecords } from "@/lib/cms/audit";
import { FAQ_CACHE }          from "@/features/faq/config/faq.config";
import { mapFaq }             from "@/lib/db/mappers";

export const dynamic = "force-dynamic";

export async function GET(_req: NextRequest, ctx: { params: Promise<{ id: string }> }): Promise<NextResponse> {
  try {
    const session = await requireSession();
    requirePermission(session.role, "faq.read");
    const { id } = await ctx.params; parseObjectId(id);
    await connectDB();
    const raw = await FAQ.findById(id).lean();
    if (!raw) throw new NotFoundError("FAQ");
    return ok(mapFaq(raw));
  } catch (e) { return handleRouteError(e); }
}

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }): Promise<NextResponse> {
  try {
    const session = await requireSession();
    requirePermission(session.role, "faq.update");
    const { id } = await ctx.params; parseObjectId(id);
    const body = await parseBody(req, faqUpdateSchema);
    await connectDB();
    const rawBefore = await FAQ.findById(id).lean();
    if (!rawBefore) throw new NotFoundError("FAQ");
    const rawUpdated = await FAQ.findByIdAndUpdate(id, { $set: body }, { new: true }).lean();
    if (!rawUpdated) throw new NotFoundError("FAQ");
    invalidateCmsCache(FAQ_CACHE, "update");
    await emitCmsAudit({ actor: { id: session.userId, role: session.role }, action: "update", resource: "faq", resourceId: id,
      changes: diffRecords(mapFaq(rawBefore), mapFaq(rawUpdated)) });
    return ok({ id });
  } catch (e) { return handleRouteError(e); }
}

export async function DELETE(_req: NextRequest, ctx: { params: Promise<{ id: string }> }): Promise<NextResponse> {
  try {
    const session = await requireSession();
    requirePermission(session.role, "faq.delete");
    const { id } = await ctx.params; parseObjectId(id);
    await connectDB();
    const raw = await FAQ.findByIdAndDelete(id).lean();
    if (!raw) throw new NotFoundError("FAQ");
    invalidateCmsCache(FAQ_CACHE, "delete");
    await emitCmsAudit({ actor: { id: session.userId, role: session.role }, action: "delete", resource: "faq", resourceId: id });
    return noContent();
  } catch (e) { return handleRouteError(e); }
}
