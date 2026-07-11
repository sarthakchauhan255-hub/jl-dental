/**
 * SEO metadata helpers.
 * generateMetadata() calls use these to build consistent, spec-compliant metadata.
 */
import type { Metadata } from "next";
import type { SeoMeta, MediaAsset } from "@/types";
import { ogImageUrl } from "@/lib/media/cloudinary-url";
import { env } from "@/env";
import { getBrandAssets } from "@/config/branding";

const APP_URL  = env.NEXT_PUBLIC_APP_URL;
const SITE_NAME = getBrandAssets().name;

export interface PageSeoInput {
  /** Page-specific override (most specific) */
  pageSeo?:    Partial<SeoMeta> | null;
  /** Entity-level fallback (e.g. doctor name, service name) */
  entityTitle?: string;
  entityDesc?:  string;
  entityImage?: MediaAsset | null;
  /** Clinic-level defaults (from CMS) */
  clinicSeo?:  Partial<SeoMeta> | null;
  /** Absolute path for canonical (e.g. "/services/teeth-whitening") */
  path:        string;
  /** Template to wrap title in */
  titleTemplate?: "default" | "blog" | "admin";
}

/**
 * Resolve SEO fields using the 4-level fallback chain:
 * pageSeo → entity defaults → clinicSeo → hardcoded fallback
 */
export function resolveMetadata(input: PageSeoInput): Metadata {
  const {
    pageSeo,
    entityTitle,
    entityDesc,
    entityImage,
    clinicSeo,
    path,
    titleTemplate = "default",
  } = input;

  // ─── Title ────────────────────────────────────────────────────────────────
  const rawTitle =
    pageSeo?.title ??
    entityTitle ??
    clinicSeo?.title ??
    SITE_NAME;

  const title = applyTitleTemplate(rawTitle, titleTemplate);

  // ─── Description ──────────────────────────────────────────────────────────
  const description =
    pageSeo?.description ??
    entityDesc ??
    clinicSeo?.description ??
    "Premium dental care in Solan, Himachal Pradesh. Book your consultation today.";

  // ─── OG Image ─────────────────────────────────────────────────────────────
  const ogAsset =
    pageSeo?.ogImage ??
    entityImage ??
    clinicSeo?.ogImage ??
    null;

  const ogImageSrc = ogAsset?.publicId
    ? ogImageUrl(ogAsset.publicId)
    : ogAsset?.url ?? null;

  // ─── Canonical ────────────────────────────────────────────────────────────
  const canonical = `${APP_URL}${path}`;

  // ─── noIndex ──────────────────────────────────────────────────────────────
  const noIndex = pageSeo?.noIndex ?? false;

  const ogImages = ogImageSrc
    ? [{ url: ogImageSrc, width: 1200, height: 630, alt: rawTitle }]
    : [];

  return {
    title,
    description,
    alternates: { canonical },
    robots: noIndex
      ? { index: false, follow: false }
      : { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large" } },
    openGraph: {
      title,
      description,
      url:      canonical,
      siteName: SITE_NAME,
      locale:   "en_IN",
      type:     "website",
      ...(ogImages.length ? { images: ogImages } : {}),
    },
    twitter: {
      card:        "summary_large_image",
      title,
      description,
      ...(ogImages.length ? { images: [ogImageSrc!] } : {}),
    },
  };
}

function applyTitleTemplate(title: string, template: PageSeoInput["titleTemplate"]): string {
  if (template === "blog")  return `${title} | ${getBrandAssets().shortName} Blog`;
  if (template === "admin") return `${title} | Admin`;
  // default: append site name only if title doesn't already contain it
  if (title === SITE_NAME)  return title;
  return `${title} | ${SITE_NAME}`;
}

/**
 * Build JSON-LD script tag content.
 * Returns a stringified JSON-LD object — inject via <script type="application/ld+json">.
 */
export function buildJsonLd(schema: Record<string, unknown>): string {
  try {
    return JSON.stringify({ "@context": "https://schema.org", ...schema });
  } catch {
    // Never break rendering for malformed schema
    return "";
  }
}

/** Organization / Dentist schema — injected on all public pages */
export function buildDentistSchema(clinic: {
  name:     string;
  url:      string;
  phone:    string;
  email:    string;
  address:  string;
  city:     string;
  state:    string;
  lat?:     number;
  lng?:     number;
  logoUrl?: string;
  ogUrl?:   string;
  social:   { instagram?: string; facebook?: string; googleBusiness?: string };
  hours?:   Record<string, { open: string; close: string; closed: boolean }>;
  avgRating?: number;
  reviewCount?: number;
}): string {
  const schema: Record<string, unknown> = {
    "@type":     "Dentist",
    name:         clinic.name,
    url:          clinic.url,
    telephone:    clinic.phone,
    email:        clinic.email,
    priceRange:   "$$",
    currenciesAccepted: "INR",
    address: {
      "@type":         "PostalAddress",
      streetAddress:    clinic.address,
      addressLocality:  clinic.city,
      addressRegion:    clinic.state,
      addressCountry:   "IN",
    },
    areaServed: { "@type": "City", name: clinic.city },
    sameAs: Object.values(clinic.social).filter(Boolean),
  };

  if (clinic.lat && clinic.lng) {
    schema.geo = {
      "@type":    "GeoCoordinates",
      latitude:   clinic.lat,
      longitude:  clinic.lng,
    };
  }

  if (clinic.logoUrl) {
    schema.logo = clinic.logoUrl;
  }

  if (clinic.avgRating && clinic.reviewCount && clinic.reviewCount > 0) {
    schema.aggregateRating = {
      "@type":      "AggregateRating",
      ratingValue:  clinic.avgRating.toFixed(1),
      reviewCount:  clinic.reviewCount,
      bestRating:   "5",
      worstRating:  "1",
    };
  }

  return buildJsonLd(schema);
}

export { APP_URL, SITE_NAME };
