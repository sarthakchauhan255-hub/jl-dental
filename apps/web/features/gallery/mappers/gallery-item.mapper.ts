import { galleryListSchema, type GalleryItemContent } from "../schemas/gallery-item.schema";
import { galleryListFallback } from "../fallback-data/gallery-item.fallback";

export function mapGalleryList(raw: unknown): GalleryItemContent[] {
  const result = galleryListSchema.safeParse(raw);
  return result.success ? result.data : galleryListFallback;
}
