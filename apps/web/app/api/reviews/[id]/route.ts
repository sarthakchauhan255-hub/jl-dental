import { type NextRequest, type NextResponse } from "next/server";
import { requireSession }    from "@/lib/auth/session";
import { requirePermission } from "@/lib/auth/rbac";
import { ok }                from "@/lib/api/responses";
import { handleRouteError }  from "@/lib/api/errors";
import { parseObjectId }     from "@/lib/api/validators";
import { NotFoundError }     from "@/lib/security/errors";
import { connectDB }         from "@/lib/db/connection";
import { Review }            from "@/models/Review";
import { mapReview }         from "@/lib/db/mappers";

export const dynamic = "force-dynamic";

export async function GET(_req: NextRequest, ctx: { params: Promise<{ id: string }> }): Promise<NextResponse> {
  try {
    const session = await requireSession();
    requirePermission(session.role, "reviews.read");
    const { id } = await ctx.params; parseObjectId(id);
    await connectDB();
    const raw = await Review.findById(id).lean();
    if (!raw) throw new NotFoundError("Review");
    return ok(mapReview(raw));
  } catch (e) { return handleRouteError(e); }
}
