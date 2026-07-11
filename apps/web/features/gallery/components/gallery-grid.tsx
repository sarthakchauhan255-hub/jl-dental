"use client";
import { useState } from "react";
import { Images }   from "lucide-react";
import { OptimizedImage } from "@/components/common/optimized-image";
import { EmptyState }     from "@/components/states";
import { galleryImageUrl } from "@/lib/media/cloudinary-url";
import { BeforeAfterSlider } from "./before-after-slider";
import { GalleryLightbox }   from "./gallery-lightbox";
import type { GalleryItemContent } from "../schemas/gallery-item.schema";

/**
 * Client island: manages lightbox open state and tab filter.
 * Receives pre-fetched, mapped content from the server page — no data fetching here.
 */
export function GalleryGrid({ items }: { items: GalleryItemContent[] }) {
  const [filter, setFilter] = useState<"all" | "before_after" | "general">("all");
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const filtered = items.filter((i) => filter === "all" || i.type === filter);
  const generalItems = filtered.filter((i) => i.type === "general" && i.image?.publicId);
  const lightboxImages = generalItems.map((i) => ({ publicId: i.image!.publicId, caption: i.caption }));

  if (items.length === 0) {
    return (
      <EmptyState
        icon={Images}
        heading="Gallery coming soon"
        description="Patient results will be showcased here shortly."
      />
    );
  }

  return (
    <div>
      <div className="flex gap-2 mb-10 justify-center">
        {[
          { key: "all" as const, label: "All" },
          { key: "before_after" as const, label: "Before & After" },
          { key: "general" as const, label: "Gallery" },
        ].map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setFilter(tab.key)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              filter === tab.key
                ? "bg-primary-700 text-white"
                : "bg-charcoal-50 text-charcoal-600 hover:bg-charcoal-100"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((item) => {
          if (item.type === "before_after" && item.before?.publicId && item.after?.publicId) {
            return (
              <BeforeAfterSlider
                key={item.id}
                beforePublicId={item.before.publicId}
                afterPublicId={item.after.publicId}
                caption={item.caption}
              />
            );
          }
          if (item.type === "general" && item.image?.publicId) {
            const idx = generalItems.findIndex((g) => g.id === item.id);
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setLightboxIndex(idx)}
                className="relative aspect-[4/3] overflow-hidden rounded-2xl group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400"
              >
                <OptimizedImage
                  src={galleryImageUrl(item.image.publicId)}
                  alt={item.caption || "Gallery image"}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="group-hover:scale-105 transition-transform duration-400"
                />
              </button>
            );
          }
          return null;
        })}
      </div>

      <GalleryLightbox
        images={lightboxImages}
        openIndex={lightboxIndex}
        onClose={() => setLightboxIndex(null)}
        onNavigate={setLightboxIndex}
      />
    </div>
  );
}
