import { faqListSchema, type FaqItemContent } from "../schemas/faq-item.schema";
import { faqListFallback } from "../fallback-data/faq-item.fallback";

export function mapFaqList(raw: unknown): FaqItemContent[] {
  const result = faqListSchema.safeParse(raw);
  return result.success ? result.data : faqListFallback;
}
