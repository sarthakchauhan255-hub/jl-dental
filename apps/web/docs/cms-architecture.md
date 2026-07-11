# CMS Architecture

_Completed: Phase 6_

---

## Architecture Overview

```
Admin (browser)
  → /admin/* pages (server-rendered, auth-gated)
    → CMS Page Components (PageHeader, SectionCard, DataTable, FormField)
      → Feature Forms / Tables (client islands — state only)
        → fetch API routes
          → API Route Handler (withAuth/withBody wrappers)
            → requireSession() + requirePermission()
            → connectDB() + Mongoose model
            → auditAction() (fire-and-forget, never blocks response)
            → revalidateTag() (ISR cache invalidation)
            → ok() / paginated() / err() (typed response envelope)
```

## Module Hierarchy

| Module | Route | API | Permission |
|---|---|---|---|
| Dashboard | `/admin/dashboard` | — | Any authed |
| Clinic Settings | `/admin/clinic` | `GET/PATCH /api/clinic` | `clinic.update` |
| Doctors | `/admin/doctors/*` | `GET/POST /api/doctors`, `GET/PATCH/DELETE /api/doctors/[id]` | `doctors.read / doctors.create / doctors.update` |
| Services | `/admin/services/*` | `GET/POST/PATCH/DELETE` | `services.*` |
| Gallery | `/admin/gallery` | `GET/POST /api/gallery`, `PATCH/DELETE /api/gallery/[id]` | `gallery.*` |
| Blog | `/admin/blog/*` | `GET/POST/PATCH/DELETE` | `blog.*` |
| FAQ | `/admin/faq/*` | `GET/POST/PATCH/DELETE` | `faq.*` |
| Reviews | `/admin/reviews` | `GET/PATCH /api/reviews` | `reviews.read / reviews.update` |

## Content Flow

```
Admin creates/edits content
  → Form submits to API route
    → Route validates with Zod
    → Route updates MongoDB via Mongoose
    → revalidateTag(CACHE_TAGS.*)  ← ISR cache cleared
    → auditAction() logged
    → Response: { success: true, data: { id, ... } }
      → Public page next request → getCmsProvider() → fresh data from DB
```

## Provider Flow

```
getCmsProvider()
  → MongoCmsProvider (production: MONGODB_URI set)
    → reads from same MongoDB collections CMS writes to
    → maps through Zod schema validators
    → falls back to typed defaults if schema fails
  → LocalFallbackProvider (development/CI without DB)
    → returns empty collections (correct empty-state rendering)
```

## Permission Flow

Every CMS API call enforces permissions at two layers:

1. **Middleware** (edge): JWT signature verify only
2. **Route handler**: `requireSession()` → DB tokenVersion check → `requirePermission(role, action)`

No inline role checks (`if role === "admin"`). All permission checks use centralized helpers from `lib/auth/permissions.ts`.

## Publishing Workflow

```
Draft → Published → Archived

Blog posts:
  - Created as "draft"
  - PATCH { status: "published" } → sets publishedAt timestamp → revalidateTag(blog)
  - PATCH { status: "archived" } → removes from public listing

Doctors / Services / Gallery / FAQ:
  - isActive: true/false toggle
  - PATCH { isActive: false } → removed from public pages on next ISR cycle

Reviews:
  - status: "pending" → "approved" → featured on homepage testimonials
  - status: "pending" → "rejected" → hidden
```

## Media Workflow

```
Admin uploads image
  → POST /api/uploads (FormData: file + folder)
    → requireSession() + canUploadMedia()
    → validateUpload(): magic bytes + MIME + size (lib/uploads/validate.ts)
    → uploadToCloudinary(): server-side only (lib/media/cloudinary.ts)
    → MediaPendingCleanup.create(): orphan tracking
    → Returns: { url, publicId, width, height }
  → Admin copies publicId/url into form fields
  → Form PATCH saves the asset reference in the document
    → MediaPendingCleanup entry stays pending until document is saved
    → Phase 7 cron will clean up orphaned uploads not attached to any document
```

## Future Extension Strategy

### Adding a new CMS module

1. **API routes**: `/app/api/{resource}/route.ts` + `[id]/route.ts`
   - Use `withAuth` / `withBody` wrappers
   - Use `parsePagination`, `buildSearchFilter`, `parseObjectId`
   - Call `revalidateTag(CACHE_TAGS.*)` after writes
   - Call `auditAction()` after writes

2. **Validation**: Add schema to `lib/validations/index.ts`

3. **List table**: `features/{resource}/components/{resource}-list-table.tsx`
   - Uses `<DataTable>` from `@/components/cms/data-table`
   - Uses `<ConfirmDialog>` for destructive actions

4. **Form**: `features/{resource}/components/{resource}-form.tsx`
   - Uses `<SectionCard>`, `<FormField>`, `<UnsavedWarning>`, `<SaveIndicator>`

5. **Admin pages**: `/app/(admin)/admin/{resource}/page.tsx` + `/new` + `/[id]`
   - Uses `<PageHeader>`, `<CmsBreadcrumb>`, `<PageContainer>`

6. **Permissions**: Add constants to `lib/auth/rbac.ts`, helpers to `lib/auth/permissions.ts`

7. **Navigation**: Add entry to `ADMIN_NAV_LINKS` in `lib/constants/app.ts`

8. **CmsProvider**: Add method to interface in `features/shared/cms/contracts/cms-provider.contract.ts`
   - Implement in `MongoCmsProvider` and `LocalFallbackProvider`

## Data Ownership

| Data | Owner | Write path | Read path |
|---|---|---|---|
| Clinic config | Admin | `/api/clinic` PATCH | `getCmsProvider().getClinicConfig()` |
| Doctors | Admin | `/api/doctors` POST/PATCH | `getCmsProvider().getDoctors()` |
| Services | Admin | `/api/services` POST/PATCH | `getCmsProvider().getServices()` |
| Gallery | Admin | `/api/gallery` POST/PATCH | `getCmsProvider().getGalleryItems()` |
| Blog posts | Admin | `/api/blog` POST/PATCH | `getCmsProvider().getPublishedPosts()` |
| FAQs | Admin | `/api/faq` POST/PATCH | `getCmsProvider().getFaqs()` |
| Reviews | Patients (submit) + Admin (moderate) | Phase 7 public form + `/api/reviews` PATCH | `getCmsProvider().getApprovedTestimonials()` |
| Media | Admin | `/api/uploads` POST | Cloudinary CDN URLs in DB documents |

## Lifecycle of Editable Content

```
1. Create:   Admin form → POST API → DB create → revalidate → live on next ISR cycle
2. Edit:     Admin form → PATCH API → DB update → revalidate → live on next ISR cycle
3. Publish:  Status toggle → PATCH API → isActive/status update → revalidate → live
4. Unpublish:Status toggle → PATCH API → isActive=false → revalidate → removed
5. Delete:   Confirm dialog → DELETE API → DB delete → revalidate → removed from site
6. Restore:  Not implemented (Phase 7+ — soft delete + audit trail restore)
```
