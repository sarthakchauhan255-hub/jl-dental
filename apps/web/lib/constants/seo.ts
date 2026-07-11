import { BRAND } from "@/config/branding";
/**
 * SEO constants — defaults and local targeting.
 */
export const SEO = {
  CLINIC_NAME:   BRAND.NAME,
  CITY:          "Solan",
  STATE:         "Himachal Pradesh",
  COUNTRY:       "India",
  COUNTRY_CODE:  "IN",
  LOCALE:        "en_IN",
  PRICE_RANGE:   "$$",
  CURRENCY:      "INR",
  TIMEZONE:      "Asia/Kolkata",

  // Title templates
  TITLE_SUFFIX:  BRAND.TITLE_SUFFIX,
  BLOG_SUFFIX:   BRAND.BLOG_SUFFIX,

  // Default description fallback
  DEFAULT_DESCRIPTION:
BRAND.DEFAULT_DESC,

  // Local targeting keywords (used in content guidance)
  PRIMARY_KEYWORDS: [
    "dentist in Solan",
    "dental clinic Solan",
    "best dentist Solan",
    "cosmetic dentist Solan",
    "root canal treatment Solan",
    "teeth whitening Solan",
  ],

  // Structured data types used per route
  SCHEMA_TYPES: {
    HOME:     ["Dentist", "WebSite"],
    SERVICE:  ["Dentist", "MedicalProcedure"],
    DOCTOR:   ["Dentist", "Physician"],
    BLOG:     ["Dentist", "Article"],
    FAQ:      ["Dentist", "FAQPage"],
    CONTACT:  ["Dentist"],
    GALLERY:  ["Dentist"],
  },
} as const;
