/**
 * Caching and ISR revalidation conventions.
 *
 * Rules:
 * - All public server components use these constants for `next: { revalidate }`
 * - Admin routes: never cache (always { cache: "no-store" })
 * - Cron/mutation routes: always revalidate relevant tags after writes
 * - Tags must be used consistently — see CACHE_TAGS below
 *
 * Usage in server components:
 *   const data = await fetch(url, { next: { revalidate: REVALIDATE.homepage } });
 *
 * Usage in route handlers after mutation:
 *   import { revalidatePath, revalidateTag } from "next/cache";
 *   revalidateTag(CACHE_TAGS.services);
 *   revalidatePath(ROUTES.SERVICES);
 */

// ─── Revalidation periods (seconds) ─────────────────────────────────────────
export const REVALIDATE = {
  /** Homepage — hero, services preview, testimonials, FAQ preview */
  homepage:    3600,   // 1 hour
  /** Services list + individual service pages */
  services:    3600,
  /** Doctors list + individual doctor pages */
  doctors:     3600,
  /** Blog listing */
  blog_list:   600,    // 10 min — content freshness matters
  /** Individual blog post */
  blog_post:   600,
  /** Gallery page */
  gallery:     1800,   // 30 min
  /** FAQ page */
  faq:         3600,
  /** Contact page / clinic config */
  contact:     3600,
  /** Review/testimonials data */
  reviews:     1800,
} as const;

// ─── Cache tags — for on-demand revalidation ──────────────────────────────────
export const CACHE_TAGS = {
  homepage:   "homepage",
  services:   "services",
  doctors:    "doctors",
  blog:       "blog",
  gallery:    "gallery",
  faq:        "faq",
  reviews:    "reviews",
  clinic:     "clinic",     // Clinic config — invalidated by CMS updates
} as const;

// ─── Fetch options helpers ────────────────────────────────────────────────────
/**
 * Use for admin API fetches — never cached.
 */
export const NO_CACHE: RequestInit = { cache: "no-store" };

/**
 * Tag a fetch for on-demand revalidation.
 * Use in server components that fetch from internal API routes.
 */
export function withTag(
  tag: (typeof CACHE_TAGS)[keyof typeof CACHE_TAGS],
  revalidate?: number
): RequestInit {
  return {
    next: {
      tags:       [tag],
      revalidate: revalidate,
    },
  } as RequestInit & { next: { tags: string[]; revalidate?: number } };
}

/**
 * Revalidation strategy per route — documents the expected caching behavior.
 * Reference this when implementing server components in Phase 5.
 */
export const PAGE_REVALIDATION: Record<string, {
  strategy:   "isr" | "dynamic" | "static";
  revalidate?: number;
  tags?:       string[];
}> = {
  "/":                   { strategy: "isr",     revalidate: REVALIDATE.homepage, tags: [CACHE_TAGS.homepage, CACHE_TAGS.clinic] },
  "/services":           { strategy: "isr",     revalidate: REVALIDATE.services, tags: [CACHE_TAGS.services] },
  "/services/[slug]":    { strategy: "isr",     revalidate: REVALIDATE.services, tags: [CACHE_TAGS.services] },
  "/doctors":            { strategy: "isr",     revalidate: REVALIDATE.doctors,  tags: [CACHE_TAGS.doctors] },
  "/doctors/[slug]":     { strategy: "isr",     revalidate: REVALIDATE.doctors,  tags: [CACHE_TAGS.doctors] },
  "/blog":               { strategy: "isr",     revalidate: REVALIDATE.blog_list, tags: [CACHE_TAGS.blog] },
  "/blog/[slug]":        { strategy: "isr",     revalidate: REVALIDATE.blog_post, tags: [CACHE_TAGS.blog] },
  "/gallery":            { strategy: "isr",     revalidate: REVALIDATE.gallery,  tags: [CACHE_TAGS.gallery] },
  "/faq":                { strategy: "isr",     revalidate: REVALIDATE.faq,      tags: [CACHE_TAGS.faq] },
  "/contact":            { strategy: "isr",     revalidate: REVALIDATE.contact,  tags: [CACHE_TAGS.clinic] },
  "/appointments":       { strategy: "dynamic"                                                              },
  "/admin/:path*":       { strategy: "dynamic"                                                              },
  "/api/:path*":         { strategy: "dynamic"                                                              },
};
