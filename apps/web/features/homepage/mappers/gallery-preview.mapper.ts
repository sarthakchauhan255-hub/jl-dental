import { galleryPreviewSchema, type GalleryPreviewContent } from "../schemas/gallery-preview.schema";
import { galleryPreviewFallback } from "../fallback-data/gallery-preview.fallback";

export function mapGalleryPreview(raw: unknown): GalleryPreviewContent {
  if (!raw || typeof raw !== "object") return galleryPreviewFallback;
  const result = galleryPreviewSchema.safeParse(raw);
  return result.success ? result.data : galleryPreviewFallback;
}
