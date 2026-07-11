import type { Metadata } from "next";
import { notFound }      from "next/navigation";
import Link               from "next/link";
import { OptimizedImage } from "@/components/common/optimized-image";
import { Reveal }         from "@/components/common/motion";
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
    <article className="container-narrow py-16">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: schema }} />

      {post.coverImage?.publicId && (
        <div className="relative aspect-video w-full overflow-hidden rounded-2xl mb-10">
          <OptimizedImage
            src={blogCoverUrl(post.coverImage.publicId, 1200)}
            alt={post.title}
            fill
            priority
            sizes="(max-width: 768px) 100vw, 800px"
          />
        </div>
      )}

      <Reveal variant="fadeUp">
        <span className="text-xs font-medium uppercase tracking-wider text-primary-600">{post.category}</span>
        <h1 className="heading-1 mt-2 mb-4 balance">{post.title}</h1>
        <div className="flex items-center gap-2 text-sm text-charcoal-400 mb-10">
          <span>{post.author}</span>
          {post.publishedAt && <><span aria-hidden="true">·</span><span>{formatDateIST(post.publishedAt)}</span></>}
          <span aria-hidden="true">·</span>
          <span>{readTime(post.content)} min read</span>
        </div>

        <div className="prose prose-charcoal max-w-none body-base text-charcoal-700 leading-relaxed whitespace-pre-line">
          {post.content}
        </div>
      </Reveal>

      <div className="mt-14 rounded-2xl bg-primary-50 p-8 text-center">
        <h2 className="heading-3 mb-3">Have questions about your dental health?</h2>
        <Link
          href="/book"
          className="inline-flex items-center justify-center rounded-lg bg-primary-700 px-7 py-3 text-sm font-medium text-white hover:bg-primary-800 transition-colors"
        >
          Book a Consultation
        </Link>
      </div>
    </article>
  );
}

export async function generateStaticParams() {
  const { getPublishedPosts } = await import('@/features/blog/server/get-blog-posts');
  const posts = await getPublishedPosts();
  return posts.map((p) => ({ slug: p.slug }));
}
