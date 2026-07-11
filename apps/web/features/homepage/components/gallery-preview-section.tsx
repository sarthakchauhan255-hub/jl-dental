import Link from "next/link";
import { Images, ArrowRight } from "lucide-react";
import { Section, SectionHeader } from "@/components/common/section";
import { EmptyState }            from "@/components/states";
import { galleryImageUrl }       from "@/lib/media/cloudinary-url";
import { OptimizedImage }        from "@/components/common/optimized-image";
import type { GalleryPreviewContent } from "../schemas/gallery-preview.schema";
import type { GalleryItemContent }    from "@/features/gallery/schemas/gallery-item.schema";

export function GalleryPreviewSection({
  content, items,
}: { content: GalleryPreviewContent; items: GalleryItemContent[] }) {
  if (!content.enabled) return null;

  const featured = items.slice(0, 3);

  return (
    <Section bg="white">
      <SectionHeader label="Patient Gallery" heading={content.title} subtext={content.subtitle} />

      {featured.length === 0 ? (
        <EmptyState
          icon={Images}
          heading="Gallery coming soon"
          description="Patient results will be showcased here shortly."
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {featured.map((item) => {
            const imgId = item.type === "before_after" ? item.after?.publicId : item.image?.publicId;
            return (
              <div key={item.id}>
                <div className="relative aspect-[4/3] overflow-hidden rounded-2xl">
                  {imgId ? (
                    <OptimizedImage
                      src={galleryImageUrl(imgId)}
                      alt={item.caption || "Patient result"}
                      fill
                      sizes="(max-width: 640px) 100vw, 33vw"
                      className="hover:scale-105 transition-transform duration-400"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-primary-50">
                      <Images className="h-8 w-8 text-primary-300" aria-hidden="true" />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {featured.length > 0 && (
        <div className="mt-10 text-center">
          <Link href="/gallery" className="inline-flex items-center gap-1.5 text-sm font-medium text-primary-700 hover:text-primary-800">
            View full gallery <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      )}
    </Section>
  );
}
