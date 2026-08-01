import Link from "next/link";
import { FileText, ArrowRight } from "lucide-react";
import { OptimizedImage } from "@/components/common/optimized-image";
import { blogCoverUrl }   from "@/lib/media/cloudinary-url";
import { formatDateIST }  from "@/lib/timezone";
import type { BlogPostContent } from "../schemas/blog-post.schema";

function readTime(content: string): number {
  return Math.max(1, Math.ceil(content.trim().split(/\s+/).length / 200));
}

/** Large editorial treatment for the newest post at the top of the blog list. */
export function BlogFeatured({ post }: { post: BlogPostContent }) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group grid items-center gap-8 overflow-hidden rounded-3xl border border-border/60 bg-card p-4 shadow-sm transition-shadow duration-300 hover:shadow-lg md:grid-cols-2 md:gap-10 md:p-6"
    >
      <div className="relative aspect-[4/3] overflow-hidden rounded-2xl">
        {post.coverImage?.publicId ? (
          <OptimizedImage
            src={blogCoverUrl(post.coverImage.publicId)}
            alt={post.title}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-primary-50">
            <FileText className="h-12 w-12 text-primary-300" aria-hidden="true" />
          </div>
        )}
        <span className="absolute left-4 top-4 rounded-full bg-primary-900 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-white">
          Featured
        </span>
      </div>
      <div className="md:pr-6">
        <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[hsl(var(--accent-cyan))]">
          {post.category}
        </span>
        <h2 className="heading-2 mb-3 mt-2 text-primary-900 transition-colors group-hover:text-primary-700">
          {post.title}
        </h2>
        {post.excerpt && (
          <p className="body-base mb-5 line-clamp-3 max-w-prose text-muted-foreground">{post.excerpt}</p>
        )}
        <div className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
          {post.publishedAt && <span>{formatDateIST(post.publishedAt)}</span>}
          <span aria-hidden="true">·</span>
          <span>{readTime(post.content)} min read</span>
        </div>
        <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary-700">
          Read article
          <ArrowRight
            className="h-4 w-4 text-[hsl(var(--accent-cyan))] transition-transform duration-300 group-hover:translate-x-1"
            aria-hidden="true"
          />
        </span>
      </div>
    </Link>
  );
}
