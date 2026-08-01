import type { Metadata } from "next";
import { Section } from "@/components/common/section";
import { GalleryGrid }     from "@/features/gallery/components/gallery-grid";
import { getCmsProvider }   from "@/features/shared/cms";
import { resolveMetadata } from "@/lib/seo";
import { REVALIDATE }      from "@/lib/cache";
import { BRAND } from "@/config/branding";

export const revalidate = REVALIDATE.gallery;

export async function generateMetadata(): Promise<Metadata> {
  return resolveMetadata({
    path: "/gallery",
    entityTitle: "Patient Gallery — Before & After",
    entityDesc:  `Real patient transformations from ${BRAND.NAME}, ${BRAND.CITY}.`,
  });
}

export default async function GalleryPage() {
  const cms = getCmsProvider();
  const items = await cms.getGalleryItems();

  return (
    <>
      {/* Petrol hero header (matches the doctors page) */}
      <section className="bg-primary-900 text-white">
        <div className="container-base py-20 md:py-28 lg:py-32">
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-[hsl(var(--accent-cyan))]">
            Our Work
          </p>
          <h1 className="heading-1 max-w-3xl text-white">Patient Gallery</h1>
          <p className="body-lg mt-5 max-w-xl text-white/70">
            Real results from real patients at our Solan clinic.
          </p>
        </div>
      </section>

      <Section bg="muted" size="lg">
        <GalleryGrid items={items} />
      </Section>
    </>
  );
}
