"use client";
import { galleryImageUrl }    from "@/lib/media/cloudinary-url";
import { BeforeAfterAdapter } from "../adapters/before-after-adapter";

interface BeforeAfterSliderProps {
  beforePublicId: string;
  afterPublicId:  string;
  caption?:       string;
}

/**
 * Gallery-domain before/after slider. Fills its (2×2 feature) tile.
 * Delegates the drag/comparison to BeforeAfterAdapter — never imports vendor directly.
 */
export function BeforeAfterSlider({ beforePublicId, afterPublicId, caption }: BeforeAfterSliderProps) {
  return (
    <div className="relative h-full w-full overflow-hidden rounded-2xl shadow-lg">
      <BeforeAfterAdapter
        beforeSrc={galleryImageUrl(beforePublicId)}
        afterSrc={galleryImageUrl(afterPublicId)}
        beforeAlt={caption ? `${caption} — before` : "Before"}
        afterAlt={caption  ? `${caption} — after`  : "After"}
        className="h-full w-full"
      />
      <span className="pointer-events-none absolute left-3 top-3 rounded-full bg-primary-900 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-white">
        Before
      </span>
      <span className="pointer-events-none absolute right-3 top-3 rounded-full bg-[hsl(var(--accent-cyan))] px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-white">
        After
      </span>
      {caption && (
        <span className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-charcoal-900/75 to-transparent p-3 text-sm font-medium text-white">
          {caption}
        </span>
      )}
    </div>
  );
}
