import type { Metadata } from "next";
import { redirect }      from "next/navigation";
import { getAuthUser }   from "@/lib/auth/session";
import { hasPermission } from "@/lib/auth/rbac";
import { connectDB }     from "@/lib/db/connection";
import { BlogPost }      from "@/models/BlogPost";
import { ResourceListPage } from "@/components/cms/engine";
import { blogConfig }  from "@/features/blog/config/blog.config";
import { blogService } from "@/features/blog/service/blog.service";
import type { BlogRecord } from "@/features/blog/service/blog.service";
import { mapBlogPost }      from "@/lib/db/mappers";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Blog | Admin", robots: { index: false, follow: false } };

export default async function BlogAdminPage() {
  const user = await getAuthUser();
  if (!user || !hasPermission(user.role, "blog.read")) redirect("/admin/dashboard");

  await connectDB();
  const [docs, total] = await Promise.all([
    BlogPost.find({}).sort({ createdAt: -1 }).limit(10).lean(),
    BlogPost.countDocuments({}),
  ]);

  const initialData: BlogRecord[] = docs.map(mapBlogPost) as BlogRecord[];

  return (
    <ResourceListPage
      config={blogConfig}
      service={blogService}
      initialData={initialData}
      initialTotal={total}
      user={user}
    />
  );
}
