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
    <Link href={`/blog/${post.slug}`} className="group block card-base overflow-hidden h-full hover:shadow-md transition-shadow duration-300">
      {post.coverImage?.publicId ? (
        <div className="relative aspect-video overflow-hidden">
          <OptimizedImage
            src={blogCoverUrl(post.coverImage.publicId)}
            alt={post.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="group-hover:scale-105 transition-transform duration-400"
          />
        </div>
      ) : (
        <div className="flex aspect-video items-center justify-center bg-primary-50">
          <FileText className="h-10 w-10 text-primary-300" aria-hidden="true" />
        </div>
      )}
      <div className="p-6">
        <span className="text-xs font-medium uppercase tracking-wider text-primary-600">{post.category}</span>
        <h2 className="heading-4 mt-2 mb-2 line-clamp-2">{post.title}</h2>
        {post.excerpt && <p className="body-sm text-muted-foreground line-clamp-2 mb-3">{post.excerpt}</p>}
        <div className="flex items-center gap-2 text-xs text-charcoal-400">
          {post.publishedAt && <span>{formatDateIST(post.publishedAt)}</span>}
          <span aria-hidden="true">·</span>
          <span>{readTime(post.content)} min read</span>
        </div>
      </div>
    </Link>
  );
}
