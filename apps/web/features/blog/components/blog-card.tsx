import Link from "next/link";
import { FileText } from "lucide-react";
import { OptimizedImage } from "@/components/common/optimized-image";
import { blogCoverUrl }   from "@/lib/media/cloudinary-url";
import { formatDateIST }  from "@/lib/timezone";
import type { BlogPostContent } from "../schemas/blog-post.schema";

function readTime(content: string): number {
  const words = content.trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 200));
}

export function BlogCard({ post }: { post: BlogPostContent }) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
    >
      {post.coverImage?.publicId ? (
        <div className="relative aspect-video overflow-hidden">
          <OptimizedImage
            src={blogCoverUrl(post.coverImage.publicId)}
            alt={post.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>
      ) : (
        <div className="flex aspect-video items-center justify-center bg-primary-50">
          <FileText className="h-10 w-10 text-primary-300" aria-hidden="true" />
        </div>
      )}
      <div className="flex flex-1 flex-col p-6">
        <span className="text-xs font-semibold uppercase tracking-[0.12em] text-[hsl(var(--accent-cyan))]">
          {post.category}
        </span>
        <h2 className="heading-4 mb-2 mt-2 line-clamp-2 text-primary-900 transition-colors group-hover:text-primary-700">
          {post.title}
        </h2>
        {post.excerpt && (
          <p className="body-sm mb-4 line-clamp-2 text-muted-foreground">{post.excerpt}</p>
        )}
        <div className="mt-auto flex items-center gap-2 text-xs text-muted-foreground">
          {post.publishedAt && <span>{formatDateIST(post.publishedAt)}</span>}
          <span aria-hidden="true">·</span>
          <span>{readTime(post.content)} min read</span>
        </div>
      </div>
    </Link>
  );
}
