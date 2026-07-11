import type { MetadataRoute } from "next";
import { env } from "@/env";

/**
 * Dynamic sitemap — static routes plus published CMS entities.
 * Reads through the public CmsProvider only; drafts and inactive
 * entities are excluded by the provider itself.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = env.NEXT_PUBLIC_APP_URL.replace(/\/$/, "");
  const now  = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${base}/`,         lastModified: now, changeFrequency: "weekly",  priority: 1.0 },
    { url: `${base}/services`, lastModified: now, changeFrequency: "weekly",  priority: 0.9 },
    { url: `${base}/doctors`,  lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/gallery`,  lastModified: now, changeFrequency: "weekly",  priority: 0.7 },
    { url: `${base}/blog`,     lastModified: now, changeFrequency: "weekly",  priority: 0.8 },
    { url: `${base}/faq`,      lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/contact`,  lastModified: now, changeFrequency: "yearly",  priority: 0.7 },
    { url: `${base}/book`,     lastModified: now, changeFrequency: "yearly",  priority: 0.9 },
  ];

  try {
    const { getCmsProvider } = await import("@/features/shared/cms");
    const cms = getCmsProvider();
    const [services, doctors, posts] = await Promise.all([
      cms.getServices(), cms.getDoctors(), cms.getPublishedPosts(),
    ]);
    return [
      ...staticRoutes,
      ...services.map(s => ({ url: `${base}/services/${s.slug}`, lastModified: now, changeFrequency: "monthly" as const, priority: 0.8 })),
      ...doctors.map(d  => ({ url: `${base}/doctors/${d.slug}`,  lastModified: now, changeFrequency: "monthly" as const, priority: 0.7 })),
      ...posts.map(p    => ({ url: `${base}/blog/${p.slug}`,     lastModified: now, changeFrequency: "monthly" as const, priority: 0.6 })),
    ];
  } catch {
    // DB unavailable at build → static routes only; regenerates at runtime
    return staticRoutes;
  }
}
