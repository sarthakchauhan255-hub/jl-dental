import { heroSchema, type HeroContent } from "../schemas/hero.schema";
import { heroFallback } from "../fallback-data/hero.fallback";

/**
 * Maps raw clinic CMS data (or null/undefined) to validated HeroContent.
 *
 * This is the ONLY place a page is allowed to touch unvalidated CMS shape.
 * Components never receive raw CMS documents — only this mapper's output.
 *
 * Failure mode: any malformed/missing field falls back to safe defaults,
 * never throws, never renders broken content.
 */
export function mapHeroContent(raw: unknown): HeroContent {
  if (!raw || typeof raw !== "object") return heroFallback;

  const result = heroSchema.safeParse(raw);
  if (!result.success) return heroFallback;

  return result.data;
}
