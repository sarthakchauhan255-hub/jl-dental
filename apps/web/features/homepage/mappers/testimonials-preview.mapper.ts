import { testimonialsPreviewSchema, type TestimonialsPreviewContent } from "../schemas/testimonials-preview.schema";
import { testimonialsPreviewFallback } from "../fallback-data/testimonials-preview.fallback";

export function mapTestimonialsPreview(raw: unknown): TestimonialsPreviewContent {
  if (!raw || typeof raw !== "object") return testimonialsPreviewFallback;
  const result = testimonialsPreviewSchema.safeParse(raw);
  return result.success ? result.data : testimonialsPreviewFallback;
}
