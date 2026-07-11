/**
 * Single source of truth for all brand asset references.
 *
 * Rule: nothing in the app imports "/public/branding/*.svg" directly.
 * Every consumer (navbar, footer, SEO, OG, favicon, email templates,
 * admin sidebar, loading states) calls getBrandAssets().
 *
 * Future logo replacement requires changing only this file.
 */

export interface BrandAssets {
  name:      string;
  shortName: string;
  tagline:   string;
  logo: {
    /** Default — dark text, suitable on white/light backgrounds */
    default:     string;
    /** Light variant — white text, suitable on dark/colored backgrounds (footer, hero navbar) */
    light:       string;
    /** Dark variant — higher contrast on off-white or light-gray backgrounds */
    dark:        string;
    /** Icon-only mark — square, used in favicons, app icons, small contexts */
    icon:        string;
    /** Monochrome mark — single color, used for print or low-color contexts */
    monochrome:  string | null;
  };
  favicon: {
    svg:   string;
    ico:   string | null;   // generate from icon.svg at deployment
    icon192: string | null; // PWA icon 192×192
    icon512: string | null; // PWA icon 512×512
    apple:   string | null; // apple-touch-icon 180×180
  };
  /** Used as a text fallback whenever no image asset is available */
  monogram: string;
}

const BRAND_ASSETS: BrandAssets = {
  name:      "JL Dental Clinic",  // brand-ok — this IS config/branding.ts
  shortName: "JL Dental",         // brand-ok
  tagline:   "Premium Dental Care in Solan", // brand-ok
  logo: {
    default:    "/branding/logo.svg",
    light:      "/branding/logo-light.svg",
    dark:       "/branding/logo-dark.svg",
    icon:       "/branding/favicon/icon.svg",
    monochrome: null,  // add /branding/logo-mono.svg when available
  },
  favicon: {
    svg:     "/branding/favicon/icon.svg",
    ico:     null,     // /branding/favicon/favicon.ico — generate at deployment
    icon192: null,     // /branding/favicon/icon-192.png
    icon512: null,     // /branding/favicon/icon-512.png
    apple:   null,     // /branding/favicon/apple-touch-icon.png
  },
  monogram: "JL",
};


/**
 * Design token references for brand colors.
 * Values reference Tailwind CSS variable names — not hex codes.
 * The actual hex lives in tailwind.config.ts tokens.
 * This prepares the branding system for future design refresh without
 * touching component code — only tailwind.config.ts needs updating.
 */
export const BRAND_COLORS = {
  primary:    "primary",      // core blue → tailwind: primary-{shade}
  secondary:  "charcoal",     // text/ui → tailwind: charcoal-{shade}
  background: "background",   // page background → CSS var: --background
  surface:    "white",        // card/panel surface
  text:       "foreground",   // body text → CSS var: --foreground
  muted:      "muted",        // subdued text → CSS var: --muted
  accent:     "accent-gold",  // highlight/star accent
  success:    "green",        // tailwind: green-{shade}
  warning:    "amber",        // tailwind: amber-{shade}
  error:      "destructive",  // CSS var: --destructive
  border:     "border",       // CSS var: --border
} as const;

export type BrandColorKey = keyof typeof BRAND_COLORS;

/** The only sanctioned access point for brand assets. */
export function getBrandAssets(): BrandAssets {
  return BRAND_ASSETS;
}


/**
 * Brand string constants — import these instead of writing literal strings.
 * Centralised so a clinic rename requires one file change only.
 */
export const BRAND = {
  NAME:        "JL Dental Clinic",
  SHORT_NAME:  "JL Dental",
  TAGLINE:     "Premium Dental Care in Solan",
  CITY:        "Solan",
  STATE:       "Himachal Pradesh",
  COUNTRY:     "India",
  /** Used as a default author on blog posts */
  AUTHOR:      "JL Dental",
  /** Full page title for root metadata */
  DEFAULT_TITLE: "JL Dental Clinic — Premium Dental Care in Solan",
  /** Default meta description */
  DEFAULT_DESC:
    "JL Dental Clinic offers world-class dental care in Solan, Himachal Pradesh. " +
    "Expert cosmetic, restorative, and preventive dental treatments. Book today.",

  /** Page title template suffix */
  TITLE_SUFFIX:  " | JL Dental Clinic",
  /** Blog title suffix */
  BLOG_SUFFIX:   " | JL Dental Blog",
  /** Admin portal label */
  ADMIN_LABEL:   "JL Dental Admin",
  /** WhatsApp default message */
  WHATSAPP_MSG:  "Hello, I'd like to book an appointment at JL Dental Clinic.",
  /** Tagline with location */
  TAGLINE_FULL:  "JL Dental Clinic — Solan",
  /** City + state */
  LOCATION:      "Solan, Himachal Pradesh",
  /** Kebab-case slug — used for DB document slugs, Cloudinary folder prefix, logger service ID */
  SLUG:                   "jl-dental",
  /** Cloudinary root folder prefix for all media */
  CLOUDINARY_PREFIX:      "jl-dental",
  /** Support / admin email displayed in UI placeholders */
  SUPPORT_EMAIL:          "admin@jldental.com",
  /** Organization schema.org name (used in JSON-LD) */
  ORG_SCHEMA_NAME:        "JL Dental Clinic",
  /** OpenGraph default title (same as DEFAULT_TITLE but aliased for clarity) */
  OG_TITLE:               "JL Dental Clinic — Premium Dental Care in Solan",
  /** Footer copyright suffix */
  COPYRIGHT_SUFFIX:       ". All rights reserved.",
  /** Browser theme color (light) */
  THEME_COLOR_LIGHT:      "#1d4ed8",
  /** Browser theme color (dark) */
  THEME_COLOR_DARK:       "#0d1520",
  /** Logo alt text */
  LOGO_ALT:               "JL Dental Clinic logo",

} as const;
