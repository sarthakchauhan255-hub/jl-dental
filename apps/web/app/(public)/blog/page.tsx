import type { Metadata } from "next";
import { FileText } from "lucide-react";
import { Section } from "@/components/common/section";
import { StaggerReveal, Reveal }  from "@/components/common/motion";
import { EmptyState }       from "@/components/states";
import { BlogCard }         from "@/features/blog/components/blog-card";
import { BlogFeatured }     from "@/features/blog/components/blog-featured";
import { getCmsProvider }     from "@/features/shared/cms";
import { resolveMetadata }  from "@/lib/seo";
import { REVALIDATE }       from "@/lib/cache";
import { BRAND } from "@/config/branding";

export const revalidate = REVALIDATE.blog_list;
const PAGE_SIZE = 9;

export async function generateMetadata(): Promise<Metadata> {
  return resolveMetadata({
    path: "/blog",
    entityTitle: "Dental Health Blog",
    entityDesc:  `Expert dental advice and clinic updates from ${BRAND.NAME}, ${BRAND.CITY}.`,
  });
}

export default async function BlogPage({
  searchParams,
}: { searchParams: Promise<{ page?: string }> }) {
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, parseInt(pageParam ?? "1", 10) || 1);

  const cms = getCmsProvider();
  const allPosts = await cms.getPublishedPosts();
  const totalPages = Math.max(1, Math.ceil(allPosts.length / PAGE_SIZE));
  const posts = allPosts.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Feature the newest post on page 1 only.
  const featured = page === 1 ? posts[0] : undefined;
  const gridPosts = featured ? posts.slice(1) : posts;

  return (
    <>
      {/* Petrol hero */}
      <section className="bg-primary-900 text-white">
        <div className="container-base py-20 md:py-28 lg:py-32">
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-[hsl(var(--accent-cyan))]">
            Insights
          </p>
          <h1 className="heading-1 max-w-3xl text-white">Dental Health Blog</h1>
          <p className="body-lg mt-5 max-w-xl text-white/70">
            Expert advice and updates from our clinic.
          </p>
        </div>
      </section>

      <Section bg="muted" size="lg">
        {posts.length === 0 ? (
          <EmptyState
            icon={FileText}
            heading="New articles coming soon"
            description="We're working on helpful content for our patients. Check back soon."
          />
        ) : (
          <>
            {featured && (
              <Reveal variant="fadeUp" className="mb-12">
                <BlogFeatured post={featured} />
              </Reveal>
            )}

            {gridPosts.length > 0 && (
              <StaggerReveal className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {gridPosts.map((post) => (
                  <Reveal key={post.id} variant="fadeUp">
                    <BlogCard post={post} />
                  </Reveal>
                ))}
              </StaggerReveal>
            )}

            {totalPages > 1 && (
              <nav aria-label="Blog pagination" className="mt-14 flex justify-center gap-2">
                {Array.from({ length: totalPages }).map((_, i) => {
                  const p = i + 1;
                  return (
                    <a
                      key={p}
                      href={p === 1 ? "/blog" : `/blog?page=${p}`}
                      aria-current={p === page ? "page" : undefined}
                      className={`flex h-10 w-10 items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                        p === page ? "bg-primary-900 text-white" : "text-charcoal-600 hover:bg-charcoal-100"
                      }`}
                    >
                      {p}
                    </a>
                  );
                })}
              </nav>
            )}
          </>
        )}
      </Section>
    </>
  );
}
