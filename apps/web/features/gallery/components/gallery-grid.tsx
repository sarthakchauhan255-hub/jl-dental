"use client";

import { useEffect, useMemo, useState } from "react";
import { Images } from "lucide-react";
import { OptimizedImage } from "@/components/common/optimized-image";
import { EmptyState } from "@/components/states";
import { Reveal } from "@/components/common/motion";
import { galleryImageUrl } from "@/lib/media/cloudinary-url";
import { BeforeAfterSlider } from "./before-after-slider";
import { GalleryLightbox } from "./gallery-lightbox";
import type { GalleryItemContent } from "../schemas/gallery-item.schema";

type Filter = "all" | "before_after" | "general";

const TABS: [Filter, string][] = [
  ["all", "All"],
  ["before_after", "Before & After"],
  ["general", "Gallery"],
];

/**
 * Gallery — a self-packing "dense mosaic" that mixes both item types in any order:
 *   • before/after  → a 2×2 feature tile (the interactive slider)
 *   • portrait photo → a 1×2 tall tile
 *   • other photo    → a 1×1 tile
 * grid-auto-flow:dense packs everything gap-free regardless of upload order.
 *
 * Orientation isn't stored in the CMS, so we detect it on the client by preloading
 * a tiny version of each photo, then reveal the mosaic already correctly laid out.
 */
export function GalleryGrid({ items }: { items: GalleryItemContent[] }) {
  const [filter, setFilter] = useState<Filter>("all");
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [portrait, setPortrait] = useState<Record<string, boolean>>({});
  const [measured, setMeasured] = useState(false);

  const generalAll = useMemo(
    () => items.filter((i) => i.type === "general" && i.image?.publicId),
    [items],
  );

  // Detect orientation client-side (CMS stores no dimensions) via tiny preloads.
  useEffect(() => {
    if (generalAll.length === 0) {
      setMeasured(true);
      return;
    }
    const map: Record<string, boolean> = {};
    let done = 0;
    const finish = () => {
      if (++done >= generalAll.length) {
        setPortrait(map);
        setMeasured(true);
      }
    };
    const safety = setTimeout(() => {
      setPortrait(map);
      setMeasured(true);
    }, 2500);
    generalAll.forEach((it) => {
      const img = new window.Image();
      img.onload = () => {
        map[it.id] = img.naturalHeight > img.naturalWidth * 1.1;
        finish();
      };
      img.onerror = finish;
      img.src = galleryImageUrl(it.image!.publicId, 48);
    });
    return () => clearTimeout(safety);
  }, [generalAll]);

  if (items.length === 0) {
    return (
      <EmptyState
        icon={Images}
        heading="Gallery coming soon"
        description="Patient results will be showcased here shortly."
      />
    );
  }

  const filtered = items.filter((i) => filter === "all" || i.type === filter);
  const lightboxImages = generalAll.map((i) => ({ publicId: i.image!.publicId, caption: i.caption }));

  return (
    <div>
      {/* Filter pills */}
      <div className="mb-10 flex flex-wrap justify-center gap-2">
        {TABS.map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => setFilter(key)}
            className={`rounded-full px-5 py-2 text-sm font-medium transition-colors ${
              filter === key
                ? "bg-primary-900 text-white"
                : "border border-border bg-card text-muted-foreground hover:border-primary-300 hover:text-primary-700"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Mosaic */}
      {!measured ? (
        <div className="grid grid-cols-2 gap-2.5 [grid-auto-flow:dense] auto-rows-[8.5rem] sm:auto-rows-[11rem] sm:gap-3.5 md:grid-cols-3 md:auto-rows-[12rem] md:gap-4 lg:grid-cols-4 lg:auto-rows-[13rem]">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className={`animate-pulse rounded-2xl bg-muted ${i % 4 === 0 ? "col-span-2 row-span-2" : ""}`}
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2.5 [grid-auto-flow:dense] auto-rows-[8.5rem] sm:auto-rows-[11rem] sm:gap-3.5 md:grid-cols-3 md:auto-rows-[12rem] md:gap-4 lg:grid-cols-4 lg:auto-rows-[13rem]">
          {filtered.map((item) => {
            if (item.type === "before_after" && item.before?.publicId && item.after?.publicId) {
              return (
                <Reveal key={item.id} variant="fadeUp" className="col-span-2 row-span-2 h-full">
                  <BeforeAfterSlider
                    beforePublicId={item.before.publicId}
                    afterPublicId={item.after.publicId}
                    caption={item.caption}
                  />
                </Reveal>
              );
            }

            if (item.type === "general" && item.image?.publicId) {
              const idx = generalAll.findIndex((g) => g.id === item.id);
              const isPortrait = portrait[item.id];
              return (
                <Reveal
                  key={item.id}
                  variant="fadeUp"
                  className={`h-full ${isPortrait ? "row-span-2" : ""}`}
                >
                  <button
                    type="button"
                    onClick={() => setLightboxIndex(idx)}
                    className="group relative block h-full w-full overflow-hidden rounded-2xl shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400"
                  >
                    <OptimizedImage
                      src={galleryImageUrl(item.image.publicId)}
                      alt={item.caption || "Gallery image"}
                      fill
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    {(item.category || item.caption) && (
                      <span className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-charcoal-900/75 to-transparent p-3 text-left">
                        {item.category && (
                          <span className="block text-[10px] font-semibold uppercase tracking-[0.12em] text-white/80">
                            {item.category}
                          </span>
                        )}
                        {item.caption && (
                          <span className="block text-sm font-medium text-white line-clamp-1">
                            {item.caption}
                          </span>
                        )}
                      </span>
                    )}
                  </button>
                </Reveal>
              );
            }

            return null;
          })}
        </div>
      )}

      <GalleryLightbox
        images={lightboxImages}
        openIndex={lightboxIndex}
        onClose={() => setLightboxIndex(null)}
        onNavigate={setLightboxIndex}
      />
    </div>
  );
}
