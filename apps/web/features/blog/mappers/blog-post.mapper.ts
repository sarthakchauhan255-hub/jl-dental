import { blogPostSchema, blogPostListSchema, type BlogPostContent } from "../schemas/blog-post.schema";
import { blogPostListFallback } from "../fallback-data/blog-post.fallback";

export function mapBlogPost(raw: unknown): BlogPostContent | null {
  const result = blogPostSchema.safeParse(raw);
  return result.success ? result.data : null;
}

export function mapBlogPostList(raw: unknown): BlogPostContent[] {
  const result = blogPostListSchema.safeParse(raw);
  return result.success ? result.data : blogPostListFallback;
}
