import { faqPreviewSchema, type FaqPreviewContent } from "../schemas/faq-preview.schema";
import { faqPreviewFallback } from "../fallback-data/faq-preview.fallback";

export function mapFaqPreview(raw: unknown): FaqPreviewContent {
  if (!raw || typeof raw !== "object") return faqPreviewFallback;
  const result = faqPreviewSchema.safeParse(raw);
  return result.success ? result.data : faqPreviewFallback;
}
