import { type NextRequest, type NextResponse } from "next/server";
import { requireSession }       from "@/lib/auth/session";
import { requirePermission }    from "@/lib/auth/rbac";
import { ok, noContent }        from "@/lib/api/responses";
import { handleRouteError }     from "@/lib/api/errors";
import { parseBody, parseObjectId } from "@/lib/api/validators";
import { NotFoundError }        from "@/lib/security/errors";
import { connectDB }            from "@/lib/db/connection";
import { BlogPost }             from "@/models/BlogPost";
import { blogPostUpdateSchema } from "@/lib/validations";
import { invalidateCmsCache }   from "@/lib/cms/cache";
import { emitCmsAudit, diffRecords } from "@/lib/cms/audit";
import { scheduleMediaForCleanup, finalizeMediaOwnership } from "@/lib/media/cleanup";
import { BLOG_CACHE, blogStatusConfig } from "@/features/blog/config/blog.config";
import { isValidTransition }    from "@/lib/cms/types";
import { mapBlogPost }          from "@/lib/db/mappers";
import type { BlogStatus }      from "@/features/blog/service/blog.service";

export const dynamic = "force-dynamic";

export async function GET(_req: NextRequest, ctx: { params: Promise<{ id: string }> }): Promise<NextResponse> {
  try {
    const session = await requireSession();
    requirePermission(session.role, "blog.read");
    const { id } = await ctx.params; parseObjectId(id);
    await connectDB();
    const raw = await BlogPost.findById(id).lean();
    if (!raw) throw new NotFoundError("Post");
    return ok(mapBlogPost(raw));
  } catch (e) { return handleRouteError(e); }
}

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }): Promise<NextResponse> {
  try {
    const session = await requireSession();
    requirePermission(session.role, "blog.update");
    const { id } = await ctx.params; parseObjectId(id);
    const body = await parseBody(req, blogPostUpdateSchema);
    await connectDB();

    const rawBefore = await BlogPost.findById(id).lean();
    if (!rawBefore) throw new NotFoundError("Post");
    const before = mapBlogPost(rawBefore);

    // Server-side status transition guard
    if (body.status && body.status !== before.status) {
      if (!isValidTransition(blogStatusConfig, before.status as BlogStatus, body.status as BlogStatus)) {
        return handleRouteError(Object.assign(
          new Error(`Cannot transition from "${before.status}" to "${body.status}".`),
          { code: "VALIDATION_ERROR", statusCode: 422 }
        ));
      }
    }

    const update: Record<string, unknown> = { ...(body as object) };
    // publishedAt set on first publish only — never overwritten
    if (body.status === "published" && !before.publishedAt) update.publishedAt = new Date();

    const rawUpdated = await BlogPost.findByIdAndUpdate(id, { $set: update }, { new: true }).lean();
    if (!rawUpdated) throw new NotFoundError("Post");
    const updated = mapBlogPost(rawUpdated);

    if (updated.coverImage?.publicId && updated.coverImage.publicId !== before.coverImage?.publicId) {
      await finalizeMediaOwnership(updated.coverImage.publicId, "blog_post", id);
      if (before.coverImage?.publicId) await scheduleMediaForCleanup(before.coverImage.publicId, "image_replaced", "blog_post", id);
    }

    invalidateCmsCache(BLOG_CACHE, body.status === "published" ? "publish" : "update");
    await emitCmsAudit({ actor: { id: session.userId, role: session.role },
      action: body.status === "published" ? "publish" : "update",
      resource: "blog_post", resourceId: id,
      changes: diffRecords(before, updated, ["content", "coverImage"]) });
    return ok({ id: updated.id, status: updated.status });
  } catch (e) { return handleRouteError(e); }
}

export async function DELETE(_req: NextRequest, ctx: { params: Promise<{ id: string }> }): Promise<NextResponse> {
  try {
    const session = await requireSession();
    requirePermission(session.role, "blog.delete");
    const { id } = await ctx.params; parseObjectId(id);
    await connectDB();
    const raw = await BlogPost.findByIdAndDelete(id).lean();
    if (!raw) throw new NotFoundError("Post");
    const doc = mapBlogPost(raw);
    if (doc.coverImage?.publicId) await scheduleMediaForCleanup(doc.coverImage.publicId, "entity_deleted", "blog_post", id);
    invalidateCmsCache(BLOG_CACHE, "delete");
    await emitCmsAudit({ actor: { id: session.userId, role: session.role }, action: "delete", resource: "blog_post", resourceId: id });
    return noContent();
  } catch (e) { return handleRouteError(e); }
}
