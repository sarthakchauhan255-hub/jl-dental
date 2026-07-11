import { FileText, Send, ArchiveX, Trash2 }   from "lucide-react";
import { ResourceStatusBadge }               from "@/components/cms/engine";
import { buildCacheConfig }                  from "@/lib/cms/cache";
import { CACHE_TAGS }                        from "@/lib/cache";
import type { CmsResourceConfig, CmsStatusConfig } from "@/lib/cms/types";
import type { BlogRecord, BlogStatus }       from "../service/blog.service";

export const BLOG_CACHE = buildCacheConfig(CACHE_TAGS.blog, false);

type BS = BlogStatus;
export const blogStatusConfig: CmsStatusConfig<BS> = {
  field:         "status",
  defaultStatus: "draft",
  definitions: [
    { value: "draft",     label: "Draft",     badgeVariant: "warning", allowedTransitions: ["published"] },
    { value: "published", label: "Published", badgeVariant: "success", allowedTransitions: ["draft"], isPublic: true },
  ],
};

export const blogConfig: CmsResourceConfig<BlogRecord, BS> = {
  meta:    { label: "Blog Post", labelPlural: "Blog Posts", icon: FileText },
  routes:  { apiPath: "/api/blog", adminPath: "/admin/blog" },
  permissions: { read: "blog.read", create: "blog.create", update: "blog.update", delete: "blog.delete", publish: "blog.update" },
  status:  blogStatusConfig,
  cache:   BLOG_CACHE,
  audit:   { resourceName: "blog_post", excludeFromDiff: ["content","coverImage"] },
  table: {
    displayField: "title",
    search: { placeholder: "Search blog posts…", fields: ["title","excerpt"] },
    filters: [
      { key: "status", label: "Status", type: "status",
        options: [{ label:"Draft", value:"draft" }, { label:"Published", value:"published" }] },
    ],
    columns: [
      { key: "title",    header: "Title",    sortable: true, cell: r => r.title },
      { key: "category", header: "Category",               cell: r => r.category },
      { key: "status",   header: "Status",                 cell: r => <ResourceStatusBadge definition={r.status === "published" ? { value:"published", label:"Published", badgeVariant:"success", allowedTransitions:[] } : { value:"draft", label:"Draft", badgeVariant:"warning", allowedTransitions:[] }} /> },
      { key: "date",     header: "Published", responsive: true, cell: r => r.publishedAt ? new Date(r.publishedAt).toLocaleDateString("en-IN") : "—" },
    ],
  },
  actions: [
    { id: "publish",   label: "Publish",   icon: Send,    scope: ["row"], permission: "blog.update",
      isAvailable: r => r.status === "draft",
      executor:    async (r,s) => {
        const svc = s as import("../service/blog.service").BlogService;
        await svc.publish(r.id);
      },
    },
    { id: "unpublish", label: "Unpublish", icon: ArchiveX, scope: ["row"], permission: "blog.update",
      isAvailable: r => r.status === "published",
      executor:    async (r,s) => {
        const svc = s as import("../service/blog.service").BlogService;
        await svc.unpublish(r.id);
      },
    },
    { id: "delete", label: "Delete", icon: Trash2, scope: ["row","bulk"], permission: "blog.delete", destructive: true,
      confirm: { title: "Delete post?", description: r => `"${r.title}" will be permanently deleted.` },
      executor: async (r,s) => { await s.delete(r.id); },
      bulkExecutor: async (rs,s) => { await s.bulkDelete(rs.map(r=>r.id)); },
    },
  ],
};
