/**
 * CMS Cache Invalidation — centralized contract.
 *
 * ARCHITECTURE:
 *  • Resources declare CmsCacheConfig (which tags to invalidate).
 *  • All cache invalidation flows through invalidateCmsCache() — never scattered calls.
 *  • Builds on existing CACHE_TAGS and revalidateTag infrastructure.
 *  • Server-side only (revalidateTag is a Next.js server function).
 */
import { revalidateTag }      from "next/cache";
import { CACHE_TAGS }         from "@/lib/cache";
import { logger }             from "@/lib/logger";
import type { CmsCacheConfig } from "./types";

export type CmsInvalidationReason = "create" | "update" | "delete" | "publish" | "archive";

/**
 * Invalidate cache tags declared by a resource.
 * Call this from API route handlers AFTER successful DB mutations.
 */
export function invalidateCmsCache(
  config:  CmsCacheConfig,
  reason:  CmsInvalidationReason,
): void {
  const tags = new Set<string>([...config.tags]);

  // Add reason-specific tags
  if (reason === "publish" && config.onPublish) {
    config.onPublish.forEach(t => tags.add(t));
  }
  if (reason === "delete" && config.onDelete) {
    config.onDelete.forEach(t => tags.add(t));
  }

  for (const tag of Array.from(tags)) {
    try {
      revalidateTag(tag);
    } catch (err: unknown) {
      // revalidateTag is a no-op outside request context — safe to catch
      logger.warn("[CmsCache] revalidateTag failed", { tag, err: String(err) });
    }
  }
}

/**
 * Build cache config for a resource, including homepage if the resource appears there.
 * Convenience helper — resources can call this or declare their own CmsCacheConfig directly.
 */
export function buildCacheConfig(
  primaryTag:   string,
  appearsOnHomepage = false,
  extraTags:    string[] = [],
): CmsCacheConfig {
  return {
    tags: [
      primaryTag,
      ...(appearsOnHomepage ? [CACHE_TAGS.homepage] : []),
      ...extraTags,
    ],
    onPublish: appearsOnHomepage ? [CACHE_TAGS.homepage] : undefined,
    onDelete:  appearsOnHomepage ? [CACHE_TAGS.homepage] : undefined,
  };
}
