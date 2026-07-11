import type { Metadata } from "next";
import { Section, SectionHeader } from "@/components/common/section";
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
    <Section bg="white" size="lg">
      <SectionHeader
        label="Our Work"
        heading="Patient Gallery"
        subtext="Real results from real patients at our Solan clinic."
      />
      <GalleryGrid items={items} />
    </Section>
  );
}
