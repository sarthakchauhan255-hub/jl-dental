import { BRAND } from "@/config/branding";
/**
 * Server-side clinic config fetcher.
 * Single source for all server components and API routes that need clinic data.
 * Results are cached appropriately per rendering strategy.
 */
import { connectDB }      from "@/lib/db";
import { Clinic }         from "@/models/Clinic";
import type { IClinic }   from "@/models/Clinic";

let clinicCache: IClinic | null = null;
let clinicCacheTime = 0;
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes in-memory cache

/**
 * Get the active clinic config.
 * In-memory cache with 5 min TTL — avoids DB hit on every ISR render.
 * Cache is invalidated when clinic config is updated via the CMS API.
 */
export async function getClinic(): Promise<IClinic | null> {
  const now = Date.now();

  if (clinicCache && now - clinicCacheTime < CACHE_TTL_MS) {
    return clinicCache;
  }

  try {
    await connectDB();
    const clinic = await Clinic.findOne({ isActive: true, slug: BRAND.SLUG }).lean() as IClinic | null;
    if (clinic) {
      clinicCache     = clinic;
      clinicCacheTime = now;
    }
    return clinic;
  } catch {
    // Return cached version if DB is temporarily unavailable
    return clinicCache;
  }
}

/**
 * Invalidate clinic cache — call after CMS updates.
 */
export function invalidateClinicCache(): void {
  clinicCache     = null;
  clinicCacheTime = 0;
}

/**
 * Get safe defaults for when clinic config is unavailable.
 * Frontend must never crash due to missing CMS data.
 */
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
