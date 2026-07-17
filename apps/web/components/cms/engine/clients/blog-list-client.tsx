"use client";
/**
 * BlogListClient — client boundary for the blog list page.
 *
 * WHY THIS EXISTS: config and service contain FUNCTIONS (cell renderers,
 * action executors, service methods). Next.js forbids passing functions from a
 * Server Component to a Client Component. This wrapper imports them on the
 * client side instead, so the server page only passes serializable data.
 */
import { ResourceListPage } from "@/components/cms/engine";
import { blogConfig } from "@/features/blog/config/blog.config";
import { blogService } from "@/features/blog/service/blog.service";
import type { BlogRecord } from "@/features/blog/service/blog.service";
import type { AuthUser } from "@/types/auth";

export function BlogListClient({
  initialData, initialTotal, user,
}: {
  initialData: BlogRecord[];
  initialTotal: number;
  user: AuthUser | null;
}) {
  return (
    <ResourceListPage
      config={blogConfig}
      service={blogService}
      initialData={initialData}
      initialTotal={initialTotal}
      user={user}
    />
  );
}
