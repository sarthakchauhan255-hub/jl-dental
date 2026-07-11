/**
 * Route constants — single source of truth for all internal paths.
 * Never hardcode path strings in components.
 */
export const ROUTES = {
  // ─── Public ─────────────────────────────────────────────────────────────
  HOME:         "/",
  SERVICES:     "/services",
  SERVICE:      (slug: string) => `/services/${slug}`,
  DOCTORS:      "/doctors",
  DOCTOR:       (slug: string) => `/doctors/${slug}`,
  GALLERY:      "/gallery",
  BLOG:         "/blog",
  BLOG_POST:    (slug: string) => `/blog/${slug}`,
  FAQ:          "/faq",
  APPOINTMENTS: "/appointments",
  CONTACT:      "/contact",

  // ─── Admin ──────────────────────────────────────────────────────────────
  ADMIN: {
    ROOT:         "/admin",
    DASHBOARD:    "/admin/dashboard",
    LOGIN:        "/admin/login",
    APPOINTMENTS: "/admin/appointments",
    APPOINTMENT:  (id: string) => `/admin/appointments/${id}`,
    DOCTORS:      "/admin/doctors",
    DOCTOR_NEW:   "/admin/doctors/new",
    DOCTOR_EDIT:  (id: string) => `/admin/doctors/${id}/edit`,
    SERVICES:     "/admin/services",
    SERVICE_NEW:  "/admin/services/new",
    SERVICE_EDIT: (id: string) => `/admin/services/${id}/edit`,
    BLOG:         "/admin/blog",
    BLOG_NEW:     "/admin/blog/new",
    BLOG_EDIT:    (id: string) => `/admin/blog/${id}/edit`,
    GALLERY:      "/admin/gallery",
    FAQ:          "/admin/faq",
    REVIEWS:      "/admin/reviews",
    CLINIC:       "/admin/clinic",
    ANALYTICS:    "/admin/analytics",
    SETTINGS:     "/admin/settings",
  },

  // ─── API ────────────────────────────────────────────────────────────────
  API: {
    AUTH_LOGIN:   "/api/auth/login",
    AUTH_LOGOUT:  "/api/auth/logout",
    AUTH_ME:      "/api/auth/me",
    CLINIC:       "/api/clinic",
    APPOINTMENTS: "/api/appointments",
    APPOINTMENT:  (id: string) => `/api/appointments/${id}`,
    DOCTORS:      "/api/doctors",
    DOCTOR:       (id: string) => `/api/doctors/${id}`,
    SERVICES:     "/api/services",
    SERVICE:      (id: string) => `/api/services/${id}`,
    BLOG:         "/api/blog",
    BLOG_POST:    (id: string) => `/api/blog/${id}`,
    GALLERY:      "/api/gallery",
    FAQ:          "/api/faq",
    REVIEWS:      "/api/reviews",
    MEDIA_UPLOAD: "/api/media/upload",
    MEDIA_DELETE: "/api/media/delete",
  },
} as const;
