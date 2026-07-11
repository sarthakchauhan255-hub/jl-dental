import { type NextRequest, type NextResponse } from "next/server";
import { requireSession }       from "@/lib/auth/session";
import { requirePermission }    from "@/lib/auth/rbac";
import { ok, paginated }        from "@/lib/api/responses";
import { handleRouteError }     from "@/lib/api/errors";
import { parsePagination }      from "@/lib/api/pagination";
import { parseBody }            from "@/lib/api/validators";
import { buildSearchFilter }    from "@/lib/api/query";
import { connectDB }            from "@/lib/db/connection";
import { BlogPost }             from "@/models/BlogPost";
import { blogPostCreateSchema } from "@/lib/validations";
import { invalidateCmsCache }   from "@/lib/cms/cache";
import { emitCmsAudit }         from "@/lib/cms/audit";
import { generateSlug }         from "@/lib/cms/validation";
import { BLOG_CACHE }           from "@/features/blog/config/blog.config";
import { mapBlogPost }          from "@/lib/db/mappers";
import { serializeObjectId }    from "@/lib/db/serializers";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    const session = await requireSession();
    requirePermission(session.role, "blog.read");
    await connectDB();
    const { page, limit, skip } = parsePagination(req.nextUrl.searchParams);
    const status = req.nextUrl.searchParams.get("status");
    const filter: Record<string, unknown> = {
      ...buildSearchFilter(req.nextUrl.searchParams.get("q"), ["title", "excerpt"]),
      ...(status ? { status } : {}),
    };
    const [docs, total] = await Promise.all([
      BlogPost.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      BlogPost.countDocuments(filter),
    ]);
    return paginated(docs.map(mapBlogPost), page, limit, total);
  } catch (e) { return handleRouteError(e); }
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const session = await requireSession();
    requirePermission(session.role, "blog.create");
    const body = await parseBody(req, blogPostCreateSchema);
    if (!body.slug) (body as Record<string, unknown>).slug = generateSlug(body.title);
    await connectDB();
    const existing = await BlogPost.exists({ slug: body.slug });
    if (existing) return handleRouteError(Object.assign(new Error("Slug exists"), { code: "CONFLICT", statusCode: 409 }));
    const post = await BlogPost.create({ ...(body as object), publishedAt: body.status === "published" ? new Date() : null });
    invalidateCmsCache(BLOG_CACHE, "create");
    await emitCmsAudit({ actor: { id: session.userId, role: session.role }, action: "create", resource: "blog_post", resourceId: serializeObjectId(post._id) });
    return ok({ id: serializeObjectId(post._id), slug: post.slug }, 201);
  } catch (e) { return handleRouteError(e); }
}
