"use client";
import { galleryImageUrl }    from "@/lib/media/cloudinary-url";
import { BeforeAfterAdapter } from "../adapters/before-after-adapter";

interface BeforeAfterSliderProps {
  beforePublicId: string;
  afterPublicId:  string;
  caption?:       string;
}

/**
 * Gallery-domain slider component.
 * Delegates comparison rendering to BeforeAfterAdapter — never imports vendor directly.
 */
export function BeforeAfterSlider({ beforePublicId, afterPublicId, caption }: BeforeAfterSliderProps) {
  return (
    <div className="relative aspect-[4/3] overflow-hidden rounded-2xl">
      <BeforeAfterAdapter
        beforeSrc={galleryImageUrl(beforePublicId)}
        afterSrc={galleryImageUrl(afterPublicId)}
        beforeAlt={caption ? `${caption} — before` : "Before"}
        afterAlt={caption  ? `${caption} — after`  : "After"}
        className="h-full w-full"
      />
      <span className="absolute left-3 top-3 rounded-full bg-charcoal-900/70 px-2.5 py-1 text-xs font-medium text-white pointer-events-none">Before</span>
      <span className="absolute right-3 top-3 rounded-full bg-charcoal-900/70 px-2.5 py-1 text-xs font-medium text-white pointer-events-none">After</span>
    </div>
  );
}
