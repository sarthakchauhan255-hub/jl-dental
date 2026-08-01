import type { Metadata } from "next";
import { notFound }      from "next/navigation";
import Link               from "next/link";
import { ArrowLeft }      from "lucide-react";
import { OptimizedImage } from "@/components/common/optimized-image";
import { Reveal }         from "@/components/common/motion";
import { ArticleBody }    from "@/features/blog/components/article-body";
import { blogCoverUrl }   from "@/lib/media/cloudinary-url";
import { formatDateIST }  from "@/lib/timezone";
import { getCmsProvider } from "@/features/shared/cms";
import { resolveMetadata, buildJsonLd } from "@/lib/seo";
import { REVALIDATE }     from "@/lib/cache";

export const revalidate = REVALIDATE.blog_post;

interface PageProps { params: Promise<{ slug: string }> }

function readTime(content: string): number {
  return Math.max(1, Math.ceil(content.trim().split(/\s+/).length / 200));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const cms = getCmsProvider();
  const post = await cms.getPostBySlug(slug);
  if (!post) return resolveMetadata({ path: `/blog/${slug}`, pageSeo: { noIndex: true } });

  return resolveMetadata({
    path: `/blog/${slug}`,
    titleTemplate: "blog",
    entityTitle:   post.title,
    entityDesc:    post.excerpt || post.title,
    entityImage:   post.coverImage,
  });
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const cms = getCmsProvider();
  const post = await cms.getPostBySlug(slug);

  if (!post) notFound();

  const schema = buildJsonLd({
    "@type":        "Article",
    headline:        post.title,
    description:     post.excerpt,
    datePublished:   post.publishedAt,
    author:          { "@type": "Organization", name: post.author },
  });

  return (
    <article className="pb-20">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: schema }} />

      {/* Header */}
      <div className="container-narrow pt-12 md:pt-20">
        <Link
          href="/blog"
          className="mb-8 inline-flex items-center gap-1.5 text-sm font-medium text-primary-700 transition-colors hover:text-primary-900"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to blog
        </Link>

        <Reveal variant="fadeUp">
          <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[hsl(var(--accent-cyan))]">
            {post.category}
          </span>
          <h1 className="heading-1 balance mb-4 mt-2 text-primary-900">{post.title}</h1>
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground">
            <span>{post.author}</span>
            {post.publishedAt && (
              <>
                <span aria-hidden="true">·</span>
                <span>{formatDateIST(post.publishedAt)}</span>
              </>
            )}
            <span aria-hidden="true">·</span>
            <span>{readTime(post.content)} min read</span>
          </div>
        </Reveal>
      </div>

      {/* Cover */}
      {post.coverImage?.publicId && (
        <div className="container-base mt-10">
          <div className="relative aspect-video w-full overflow-hidden rounded-2xl md:rounded-3xl">
            <OptimizedImage
              src={blogCoverUrl(post.coverImage.publicId, 1200)}
              alt={post.title}
              fill
              priority
              sizes="(max-width: 768px) 100vw, 1000px"
              className="object-cover"
            />
          </div>
        </div>
      )}

      {/* Body */}
      <div className="container-narrow mt-10 md:mt-14">
        <ArticleBody content={post.content} />
      </div>

      {/* CTA */}
      <div className="container-narrow mt-16">
        <div className="rounded-3xl bg-primary-900 px-6 py-12 text-center md:py-14">
          <h2 className="heading-3 mb-3 text-white">Have questions about your dental health?</h2>
          <p className="body-base mx-auto mb-6 max-w-md text-white/70">
            Book a consultation with our specialists — we're always happy to help.
          </p>
          <Link
            href="/book"
            className="btn-base inline-flex bg-white px-7 py-3 text-primary-900 hover:bg-primary-50"
          >
            Book a Consultation
          </Link>
        </div>
      </div>
    </article>
  );
}

export async function generateStaticParams() {
  const { getPublishedPosts } = await import("@/features/blog/server/get-blog-posts");
  const posts = await getPublishedPosts();
  return posts.map((p) => ({ slug: p.slug }));
}
