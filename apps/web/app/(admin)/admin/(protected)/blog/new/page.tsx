import type { Metadata }      from "next";
import { redirect }           from "next/navigation";
import { getAuthUser }        from "@/lib/auth/session";
import { BlogCreateClient } from "@/components/cms/engine/clients/blog-create-client";
import { hasPermission }      from "@/lib/auth/rbac";
import type { BlogInput } from "@/features/blog/service/blog.service";

export const metadata: Metadata = { title: "New Post | Admin", robots: { index:false, follow:false } };

export default async function NewBlogPage() {
  const user = await getAuthUser();
  if (!user || !hasPermission(user.role, "blog.create")) redirect("/admin/blog");
  return (
    <BlogCreateClient />
  );
}
