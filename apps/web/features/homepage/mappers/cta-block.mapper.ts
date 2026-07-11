import { ctaBlockSchema, type CtaBlockContent } from "../schemas/cta-block.schema";
import { ctaBlockFallback } from "../fallback-data/cta-block.fallback";

export function mapCtaBlock(raw: unknown): CtaBlockContent {
  if (!raw || typeof raw !== "object") return ctaBlockFallback;
  const result = ctaBlockSchema.safeParse(raw);
  return result.success ? result.data : ctaBlockFallback;
}
