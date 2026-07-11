import { connectDB } from "@/lib/db/connection";
import { BlogPost }  from "@/models/BlogPost";
import { mapBlogPostList, mapBlogPost } from "../mappers";
import type { BlogPostContent } from "../schemas/blog-post.schema";

function toPlain(doc: unknown) {
  return JSON.parse(JSON.stringify(doc));
}

export async function getPublishedPosts(): Promise<BlogPostContent[]> {
  try {
    await connectDB();
    const docs = await BlogPost.find({ status: "published" }).sort({ publishedAt: -1 }).lean();
    const mapped = docs.map((p) => toPlain({
      id: String(p._id), title: p.title, slug: p.slug, excerpt: p.excerpt,
      content: p.content, coverImage: p.coverImage, author: p.author,
      category: p.category, tags: p.tags,
      publishedAt: p.publishedAt ? p.publishedAt.toISOString() : null,
    }));
    return mapBlogPostList(mapped);
  } catch {
    return mapBlogPostList(null);
  }
}

export async function getPostBySlug(slug: string): Promise<BlogPostContent | null> {
  try {
    await connectDB();
    const p = await BlogPost.findOne({ slug, status: "published" }).lean();
    if (!p) return null;
    return mapBlogPost(toPlain({
      id: String(p._id), title: p.title, slug: p.slug, excerpt: p.excerpt,
      content: p.content, coverImage: p.coverImage, author: p.author,
      category: p.category, tags: p.tags,
      publishedAt: p.publishedAt ? p.publishedAt.toISOString() : null,
    }));
  } catch {
    return null;
  }
}
