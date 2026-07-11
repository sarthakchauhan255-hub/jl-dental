import type { Metadata }      from "next";
import { redirect }           from "next/navigation";
import { getAuthUser }        from "@/lib/auth/session";
import { hasPermission }      from "@/lib/auth/rbac";
import { ResourceCreatePage } from "@/components/cms/engine";
import { blogConfig }         from "@/features/blog/config/blog.config";
import { blogService }        from "@/features/blog/service/blog.service";
import { BlogFormFields }     from "@/features/blog/components/blog-form-fields";
import { blogPostCreateSchema } from "@/lib/validations";
import type { ZodSchema } from "zod";
import type { BlogInput } from "@/features/blog/service/blog.service";

export const metadata: Metadata = { title: "New Post | Admin", robots: { index:false, follow:false } };

export default async function NewBlogPage() {
  const user = await getAuthUser();
  if (!user || !hasPermission(user.role, "blog.create")) redirect("/admin/blog");
  return (
    <ResourceCreatePage config={blogConfig} service={blogService} schema={blogPostCreateSchema as unknown as ZodSchema<BlogInput>}>
      {handle => <BlogFormFields handle={handle} />}
    </ResourceCreatePage>
  );
}
