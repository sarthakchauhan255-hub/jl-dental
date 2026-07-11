# Route Ownership

Single source of truth for every route in the platform.
Update this file when routes are added, modified, or removed.

| Route | Feature | Data Source | Render Strategy | SEO Source | Auth Rule | Owner |
|---|---|---|---|---|---|---|
| `/` | `features/homepage` | `CmsProvider.getHomepageSections()` + collections | ISR (3600s) | `resolveMetadata` + Clinic name | Public | Public UI |
| `/services` | `features/services` | `CmsProvider.getServices()` | ISR (3600s) | Static title/desc | Public | Public UI |
| `/services/[slug]` | `features/services` | `CmsProvider.getServiceBySlug(slug)` | ISR (3600s), SSG params | Per-entity metadata | Public | Public UI |
| `/doctors` | `features/doctors` | `CmsProvider.getDoctors()` | ISR (3600s) | Static title/desc | Public | Public UI |
| `/doctors/[slug]` | `features/doctors` | `CmsProvider.getDoctorBySlug(slug)` | ISR (3600s), SSG params | Per-entity metadata | Public | Public UI |
| `/gallery` | `features/gallery` | `CmsProvider.getGalleryItems()` | ISR (1800s) | Static title/desc | Public | Public UI |
| `/blog` | `features/blog` | `CmsProvider.getPublishedPosts()` | ISR (600s) | Static title/desc | Public | Public UI |
| `/blog/[slug]` | `features/blog` | `CmsProvider.getPostBySlug(slug)` | ISR (600s), SSG params | Per-post metadata + Article JSON-LD | Public | Public UI |
| `/faq` | `features/faq` | `CmsProvider.getFaqs()` | ISR (3600s) | Static title/desc + FAQPage JSON-LD | Public | Public UI |
| `/contact` | `features/clinic` | `CmsProvider.getClinicConfig()` | ISR (3600s) | Static title/desc | Public | Public UI |
| `/book` | `features/appointment` | `CmsProvider.getServices()` (for form) | Dynamic (`noIndex`) | noIndex — not indexed | Public | Public UI |
| `/admin/login` | `features/auth` | None | Dynamic (`noIndex`) | noIndex | Redirect if authed | Auth |
| `/admin/forgot-password` | `features/auth` | None | Dynamic (`noIndex`) | noIndex | Public | Auth |
| `/admin/reset-password` | `features/auth` | None | Dynamic (`noIndex`) | noIndex | Public | Auth |
| `/admin/dashboard` | Admin shell | None (Phase 8) | Dynamic | noIndex | `requireSession()` | Admin |
| `/api/auth/login` | `lib/auth` | MongoDB (User) | API | — | Rate-limited, origin-checked | Auth |
| `/api/auth/logout` | `lib/auth` | None | API | — | Origin-checked | Auth |
| `/api/auth/me` | `lib/auth` | MongoDB (User via session) | API | — | Cookie | Auth |
| `/api/auth/forgot-password` | `lib/auth` | MongoDB (User, PasswordResetToken) | API | — | Rate-limited | Auth |
| `/api/auth/reset-password` | `lib/auth` | MongoDB (PasswordResetToken, User) | API | — | Rate-limited | Auth |
| `/api/auth/change-password` | `lib/auth` | MongoDB (User) | API | — | `requireSession()` | Auth |
| `/api/appointments` | Phase 6 | MongoDB (Appointment) | API | — | `requireSession()` | Appointments |
| `/api/appointments/[id]` | Phase 6 | MongoDB (Appointment) | API | — | `requireSession()` | Appointments |
| `/api/doctors` | Phase 6 | MongoDB (Doctor) | API | — | `requireSession()` + permission | Content |
| `/api/doctors/[id]` | Phase 6 | MongoDB (Doctor) | API | — | `requireSession()` + permission | Content |
| `/api/services` | Phase 6 | MongoDB (Service) | API | — | `requireSession()` + permission | Content |
| `/api/services/[id]` | Phase 6 | MongoDB (Service) | API | — | `requireSession()` + permission | Content |
| `/api/blog` | Phase 6 | MongoDB (BlogPost) | API | — | `requireSession()` + permission | Content |
| `/api/blog/[id]` | Phase 6 | MongoDB (BlogPost) | API | — | `requireSession()` + permission | Content |
| `/api/gallery` | Phase 6 | MongoDB (Gallery) | API | — | `requireSession()` + permission | Content |
| `/api/gallery/[id]` | Phase 6 | MongoDB (Gallery) | API | — | `requireSession()` + permission | Content |
| `/api/clinic` | Phase 6 | MongoDB (Clinic) | API | — | `requireSession()` + permission | Content |
| `/api/reviews` | Phase 6 | MongoDB (Review) | API | — | `requireSession()` + permission | Content |
| `/api/uploads` | `lib/uploads` | Cloudinary + MediaPendingCleanup | API | — | `requireSession()` + `canUploadMedia` | Media |

## Render Strategy Legend

| Strategy | Description |
|---|---|
| ISR (Ns) | Incremented static regeneration — page cached, revalidated every N seconds |
| SSG params | `generateStaticParams()` pre-renders all known slugs at build time |
| Dynamic | Always server-rendered per request — never cached |
| API | Next.js Route Handler — no page rendering |

## Auth Rule Legend

| Rule | Enforcement Location |
|---|---|
| Public | No auth check — accessible by anyone |
| `requireSession()` | `lib/auth/session.ts` — verifies JWT + tokenVersion in DB |
| `requireSession()` + permission | `requireSession()` + `requirePermission(role, action)` in RBAC |
| Redirect if authed | Server component checks `getSession()` → redirects to dashboard |
| Rate-limited | Upstash Redis via `lib/security/rate-limit.ts` |
| Origin-checked | `lib/security/origin.ts` validates Origin/Referer against APP_URL |

## CmsProvider Integration Points

All public data access goes through `getCmsProvider()`:

```
features/shared/cms/resolvers/get-cms-provider.ts
  → MongoCmsProvider    (MONGODB_URI present)
  → LocalFallbackProvider (no DB configured)
```

Phase 6 admin CRUD writes directly to MongoDB via API routes — the CmsProvider
is read-only by design. ISR revalidation is triggered via `revalidateTag()` after
admin mutations.
