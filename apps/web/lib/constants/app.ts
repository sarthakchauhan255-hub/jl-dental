import { BRAND } from "@/config/branding";
/**
 * App-wide constants.
 * Non-CMS values that change rarely and don't require DB storage.
 * Business content (clinic name, address etc.) lives in the DB/CMS.
 */

// ─── Pagination ─────────────────────────────────────────────────────────────
export const DEFAULT_PAGE_SIZE     = 10;
export const BLOG_PAGE_SIZE        = 9;
export const GALLERY_PAGE_SIZE     = 12;
export const APPOINTMENTS_PAGE_SIZE = 20;

// ─── Media Limits ────────────────────────────────────────────────────────────
export const MAX_IMAGE_SIZE_BYTES  = 10 * 1024 * 1024; // 10 MB
export const ALLOWED_IMAGE_TYPES   = ["image/jpeg", "image/png", "image/webp"] as const;
export const CLOUDINARY_FOLDERS = {
  general:    `${BRAND.CLOUDINARY_PREFIX}/general`,
  doctors:    `${BRAND.CLOUDINARY_PREFIX}/doctors`,
  services:   `${BRAND.CLOUDINARY_PREFIX}/services`,
  blog:       `${BRAND.CLOUDINARY_PREFIX}/blog`,
  gallery:    `${BRAND.CLOUDINARY_PREFIX}/gallery`,
  clinic:     `${BRAND.CLOUDINARY_PREFIX}/clinic`,
  reviews:    `${BRAND.CLOUDINARY_PREFIX}/reviews`,
} as const;

// ─── ISR Revalidation (seconds) ──────────────────────────────────────────────
export const REVALIDATE = {
  homepage:     3600,   // 1 hour
  services:     3600,
  doctors:      3600,
  blog_list:    600,    // 10 min
  blog_post:    600,
  gallery:      1800,   // 30 min
  faq:          3600,
  reviews:      1800,
} as const;

// ─── Appointment Status ──────────────────────────────────────────────────────
export const APPOINTMENT_STATUSES = ["pending", "approved", "rejected", "completed"] as const;

// ─── Navigation Links (structure only — labels from CMS or constants) ────────
export const NAV_LINKS = [
  { label: "Home",         href: "/"            },
  { label: "Services",     href: "/services"    },
  { label: "Our Doctors",  href: "/doctors"     },
  { label: "Gallery",      href: "/gallery"     },
  { label: "Blog",         href: "/blog"        },
  { label: "FAQ",          href: "/faq"         },
  { label: "Contact",      href: "/contact"     },
] as const;

// ─── Admin Nav ────────────────────────────────────────────────────────────────
export const ADMIN_NAV_LINKS = [
  { label: "Dashboard",       href: "/admin/dashboard", icon: "LayoutDashboard" },
  { label: "Clinic Settings", href: "/admin/clinic",    icon: "Settings" },
  { label: "Doctors",         href: "/admin/doctors",   icon: "UserRound" },
  { label: "Services",        href: "/admin/services",  icon: "Stethoscope" },
  { label: "Gallery",         href: "/admin/gallery",   icon: "Images" },
  { label: "Blog",            href: "/admin/blog",      icon: "FileText" },
  { label: "FAQ",             href: "/admin/faq",       icon: "HelpCircle" },
  //{ label: "Reviews",         href: "/admin/reviews",       icon: "Star"     },
  { label: "Appointments",    href: "/admin/appointments",  icon: "Calendar"  },
] as const;

// ─── Social / External ───────────────────────────────────────────────────────
export const SITE_NAME = BRAND.NAME;
export const WHATSAPP_MSG = BRAND.WHATSAPP_MSG;
