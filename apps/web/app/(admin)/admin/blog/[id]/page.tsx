import type { Metadata }      from "next";
import { notFound, redirect } from "next/navigation";
import { getAuthUser }        from "@/lib/auth/session";
import { hasPermission }      from "@/lib/auth/rbac";
import { connectDB }          from "@/lib/db/connection";
import { BlogPost }           from "@/models/BlogPost";
import { ResourceEditPage }   from "@/components/cms/engine";
import { blogConfig }         from "@/features/blog/config/blog.config";
import { blogService }        from "@/features/blog/service/blog.service";
import { BlogFormFields }     from "@/features/blog/components/blog-form-fields";
import { blogPostUpdateSchema } from "@/lib/validations";
import { mapBlogPost }           from "@/lib/db/mappers";
import type { ZodSchema } from "zod";
import type { BlogInput } from "@/features/blog/service/blog.service";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Edit Post | Admin", robots: { index:false, follow:false } };

export default async function EditBlogPage({ params }: { params: Promise<{id:string}> }) {
  const user = await getAuthUser();
  if (!user || !hasPermission(user.role, "blog.update")) redirect("/admin/blog");
  const {id} = await params;
  await connectDB();
  const rawDoc = await BlogPost.findById(id).lean();
  if (!rawDoc) notFound();
  const dto = mapBlogPost(rawDoc);
  return (
    <ResourceEditPage
      config={blogConfig} service={blogService} schema={blogPostUpdateSchema as unknown as ZodSchema<BlogInput>}
      record={dto as unknown as import("@/features/blog/service/blog.service").BlogRecord}
      defaultValues={{ title: dto.title, slug: dto.slug,
        status: dto.status as "draft"|"published", excerpt: dto.excerpt,
        content: dto.content, author: dto.author, category: dto.category, tags: dto.tags }}
    >
      {handle => <BlogFormFields handle={handle} isEdit />}
    </ResourceEditPage>
  );
}
