import { BRAND } from "@/config/branding";
/**
 * Server-side clinic config fetcher.
 *
 * Cached via Next's unstable_cache and keyed to the clinic + homepage cache tags,
 * so CMS updates (which call revalidateTag) propagate to the public site
 * immediately — matching how services, doctors, blog, etc. already behave.
 */
import { unstable_cache }        from "next/cache";
import { connectDB }             from "@/lib/db";
import { Clinic }                from "@/models/Clinic";
import type { IClinic }          from "@/models/Clinic";
import { CACHE_TAGS, REVALIDATE } from "@/lib/cache";

const getClinicCached = unstable_cache(
  async (): Promise<IClinic | null> => {
    await connectDB();
    return (await Clinic.findOne({ isActive: true, slug: BRAND.SLUG }).lean()) as IClinic | null;
  },
  ["clinic-config"],
  { tags: [CACHE_TAGS.clinic, CACHE_TAGS.homepage], revalidate: REVALIDATE.homepage },
);

/**
 * Get the active clinic config. Tag-invalidated on CMS updates, so homepage /
 * clinic edits show on the public site as soon as the next request renders.
 */
export async function getClinic(): Promise<IClinic | null> {
  try {
    return await getClinicCached();
  } catch {
    return null;
  }
}

/**
 * Retained for API compatibility. Freshness is now handled by tag-based
 * revalidation (revalidateTag on CACHE_TAGS.clinic / CACHE_TAGS.homepage),
 * so this is intentionally a no-op.
 */
export function invalidateClinicCache(): void {
  /* no-op — superseded by revalidateTag */
}

export function getClinicDefaults() {
  return {
    name:  BRAND.NAME,
    contact: {
      phone: "", whatsapp: "", email: "",
      address: "Solan, Himachal Pradesh",
      mapEmbedUrl: "", mapDirectionsUrl: "",
    },
    social: { instagram: "", facebook: "", googleBusiness: "", whatsapp: "" },
    seo: {
      defaultTitle:       BRAND.DEFAULT_TITLE,
      defaultDescription: "Expert dental care in Solan, Himachal Pradesh.",
    },
    homepage: {
      hero: {
        headline:    "Your Smile, Our Expertise",
        subheadline: "Premium dental care in Solan, Himachal Pradesh.",
        ctaLabel:    "Book Appointment",
        ctaHref:     "/appointments",
        image:       null,
      },
      servicesPreview:  { enabled: true, title: "Our Services", subtitle: "", maxDisplay: 6 },
      doctorsPreview:   { enabled: true, title: "Meet Our Doctors", subtitle: "" },
      testimonials:     { enabled: true, title: "What Our Patients Say", subtitle: "" },
      ctaBlock:         { enabled: true, headline: "Ready for a Beautiful Smile?", buttonLabel: "Book a Consultation", buttonHref: "/appointments" },
      faqPreview:       { enabled: true, title: "Common Questions" },
      galleryPreview:   { enabled: true, title: "Patient Results", subtitle: "" },
    },
  } as const;
}
