import { ApiResourceService } from "@/lib/cms/contracts";
import type { CmsMutationResult } from "@/lib/cms/types";
export type BlogStatus = "draft" | "published";
export interface BlogRecord extends Record<string, unknown> {
  id: string; title: string; slug: string; status: BlogStatus;
  excerpt: string; content: string; author: string;
  category: string; tags: string[];
  coverImage: { url: string; publicId: string } | null;
  publishedAt: string | null;
  seo?: { title?: string; description?: string };
  createdAt?: string; updatedAt?: string;
}
export interface BlogInput extends Record<string, unknown> {
  title: string; slug: string; status?: BlogStatus;
  excerpt?: string; content?: string; author?: string; category?: string; tags?: string[];
  coverImage?: { url: string; publicId: string } | null;
  seo?: { title?: string; description?: string };
}
export class BlogService extends ApiResourceService<BlogRecord, BlogInput> {
  constructor() { super("/api/blog"); }
  publish(id: string): Promise<CmsMutationResult<BlogRecord>> {
    return this.update(id, { status: "published", publishedAt: new Date().toISOString() });
  }
  unpublish(id: string): Promise<CmsMutationResult<BlogRecord>> {
    return this.update(id, { status: "draft" });
  }
}
export const blogService = new BlogService();
