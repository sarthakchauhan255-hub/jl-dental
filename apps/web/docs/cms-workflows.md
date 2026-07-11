# CMS Workflows

_Status: Pending approval. Drives implementation of all CMS state transitions._

Every workflow defined here must be implementable with the existing architecture:
`withAuth` / `withBody` wrappers, `auditAction()`, `revalidateTag()`, Mongoose models.

---

## General Workflow Principles

1. **Write → Validate → Persist → Invalidate → Audit** — in this order, always
2. Validation is server-side via Zod. Client-side validation is a UX aid only.
3. Every state change is recorded in AuditLog via `auditAction()`.
4. Every write that affects public pages calls `revalidateTag()` for the relevant cache tag.
5. Destructive actions (delete, archive, reject) require confirmation in the UI.
6. Errors are typed and returned as `{ success: false, error: string, fields?: Record<string, string> }`.

---

## 1. Content Creation Workflow

Applies to: Services, Doctors, Blog, Gallery, FAQ

```
Admin opens "New [Entity]" form
  → Fills required fields
  → (optional) uploads media → POST /api/uploads → receives { url, publicId }
  → Fills media field with returned asset reference
  → Submits form → POST /api/{resource}
    Server:
      → requireSession()
      → requirePermission(role, "{resource}.create")
      → parseBody(req, {resource}CreateSchema)  [Zod — throws 422 on invalid]
      → connectDB()
      → Model.create(body)
      → revalidateTag(CACHE_TAGS.{resource})
      → revalidateTag(CACHE_TAGS.homepage)  [if resource appears on homepage]
      → auditAction({ action: "create", resource, resourceId })
      → return ok({ id, slug })
  Client:
    → On success: navigate to /admin/{resource}/{id}  [edit view]
    → On validation error: display field-level errors inline
    → On server error: display error banner; form remains filled
```

### Unsaved Changes Guard
All create/edit forms use `<UnsavedWarning isDirty={isDirty} />`.
Navigating away with unsaved changes triggers browser `beforeunload` warning.

---

## 2. Content Edit Workflow

```
Admin opens edit form (pre-populated from server data)
  → Makes changes
  → Clicks "Save"
    Server:
      → requireSession()
      → requirePermission(role, "{resource}.update")
      → parseObjectId(id)
      → parseBody(req, {resource}UpdateSchema)  [partial Zod schema]
      → Model.findByIdAndUpdate(id, { $set: body }, { new: true })
      → revalidateTag(CACHE_TAGS.{resource})
      → auditAction({ action: "update", resource, resourceId })
      → return ok({ id, ... })
  Client:
    → SaveIndicator transitions: idle → saving → saved (3s) → idle
    → isDirty resets to false
    → On error: SaveIndicator shows "error"; error details displayed
```

### Slug Immutability
Slug fields are shown read-only after first activation (`isActive: true` / `status: "published"`).
Edit form disables the slug input and shows a note: "URL slug cannot be changed after publishing."

---

## 3. Publish / Activate Workflow

### Simple Toggle (Services, Doctors, Gallery, FAQ)

```
Admin clicks "Publish" / toggles "Active" switch
  → PATCH /api/{resource}/{id} { isActive: true }
    Server:
      → requireSession() + requirePermission(role, "{resource}.update")
      → findByIdAndUpdate({ isActive: true })
      → revalidateTag(CACHE_TAGS.{resource})
      → revalidateTag(CACHE_TAGS.homepage)
      → auditAction({ action: "publish", resource, resourceId })
  Client:
    → Status badge updates immediately (optimistic)
    → On error: badge reverts; error toast displayed
```

### Blog Publish (status transition)

```
Admin clicks "Publish" on a draft post
  → PATCH /api/blog/{id} { status: "published" }
    Server:
      → requirePermission(role, "blog.update")
      → validate status transition: draft → published ✓
      → findByIdAndUpdate({ status: "published", publishedAt: new Date() })
      → revalidateTag(CACHE_TAGS.blog)
      → auditAction({ action: "publish", resource: "blog_post", resourceId })
  → Post becomes visible on /blog and /blog/[slug]
  → publishedAt is now immutable
```

**Forbidden transitions (return 422):**
- `archived → published` — must restore to draft first
- `published → draft` — must archive first, then restore to draft

---

## 4. Unpublish / Deactivate Workflow

### Simple Toggle (Services, Doctors, Gallery, FAQ)

```
Admin clicks "Deactivate" / toggles off
  → PATCH /api/{resource}/{id} { isActive: false }
    → revalidateTag(CACHE_TAGS.{resource})
    → auditAction({ action: "update", resource, resourceId, meta: { isActive: false } })
  → Entity removed from public listing after ISR cycle
  → Entity still exists in DB; can be re-activated
```

### Blog Unpublish

```
Admin clicks "Unpublish"
  → PATCH /api/blog/{id} { status: "draft" }
  → Post removed from /blog listing
  → /blog/[slug] returns 404 (generateStaticParams excludes drafts)
  → publishedAt retained in DB (historical record)
```

---

## 5. Archive Workflow (Blog only)

```
Admin clicks "Archive"
  → ConfirmDialog: "Archive this post? It will be removed from the site but kept in the system."
  → Confirm → PATCH /api/blog/{id} { status: "archived" }
    → auditAction({ action: "archive", resource: "blog_post", resourceId })
  → Post excluded from /blog listing
  → /blog/[slug] returns 404
  → Post retained in DB; visible in admin with "Archived" filter
```

### Restore from Archive (Blog)

```
Admin selects archived post → clicks "Restore to Draft"
  → PATCH /api/blog/{id} { status: "draft" }
  → Post returns to draft state; not yet visible on site
  → publishedAt is NOT reset — retained for editorial reference
```

---

## 6. Delete Workflow

Applies to: Services, Doctors, Gallery, FAQ, Blog (hard delete in Phase 6)

```
Admin clicks "Delete" button in table or detail view
  → ConfirmDialog: "Delete [name]? This cannot be undone."
  → Confirm → DELETE /api/{resource}/{id}
    Server:
      → requireSession()
      → requirePermission(role, "{resource}.delete")  [or "{resource}.create" as proxy]
      → parseObjectId(id)
      → Model.findByIdAndDelete(id)
      → revalidateTag(CACHE_TAGS.{resource})
      → revalidateTag(CACHE_TAGS.homepage)
      → auditAction({ action: "delete", resource, resourceId })
      → return noContent()  [204]
  Client:
    → Router.refresh() to reload table
    → Success toast: "[Entity] deleted."
    → If delete fails: error toast; item remains in table
```

**Media on delete:**
Deleted entity's `publicId` values are not immediately removed from Cloudinary.
Phase 7 cleanup cron will process `MediaPendingCleanup` records with `reason: "entity_deleted"`.

---

## 7. Review Moderation Workflow

```
Patient submits review (Phase 7 public form)
  → Review created with status: "pending"
  → Admin sees pending count on Reviews nav item (Phase 7 badge)

Admin opens Reviews page
  → DataTable filtered to "pending" by default
  → For each review: shows patient name, rating, comment

Admin clicks "Approve":
  → PATCH /api/reviews?id={id} { status: "approved" }
  → Review appears in homepage testimonials section (after ISR cycle)
  → auditAction({ action: "update", meta: { status: "approved" } })

Admin clicks "Reject":
  → PATCH /api/reviews?id={id} { status: "rejected" }
  → Review stays hidden from public site
  → auditAction({ action: "update", meta: { status: "rejected" } })

Admin marks as Featured:
  → PATCH /api/reviews?id={id} { isFeatured: true }
  → Review prioritized in testimonials display order
```

---

## 8. Media Upload Workflow

```
Admin is in any content form that has an image field
  → Clicks "Upload Image"
  → File picker → selects file
  → Client POSTs FormData to POST /api/uploads { file, folder }
    Server:
      → requireSession()
      → canUploadMedia(session)
      → validateUpload(): magic bytes + MIME type + size limit (per folder policy)
      → uploadToCloudinary(buffer, folder, { transformation })
      → MediaPendingCleanup.create({ publicId, folder, reason: "abandoned_upload" })
      → return ok({ url, publicId, width, height, warning? })
  Client:
    → Image preview rendered from returned URL
    → { url, publicId } stored in form state
    → When form is saved: publicId is persisted in entity document
    → Orphan tracking: if form is abandoned, MediaPendingCleanup stays "pending"
      → Phase 7 cron will delete from Cloudinary after TTL
```

### Image Replacement

```
Admin replaces an existing image:
  → Old publicId is overwritten in the form field
  → On save: new publicId persisted; old publicId is now orphaned
  → Phase 7: old publicId queued in MediaPendingCleanup with reason: "image_replaced"
```

---

## 9. Clinic Settings Save Workflow

```
Admin edits Clinic Settings form
  → Changes any field
  → isDirty = true; UnsavedWarning active

Admin clicks "Save Settings"
  → PATCH /api/clinic
    Server:
      → requirePermission(role, "clinic.update")
      → clinicUpdateSchema.parse(body)
      → Clinic.findOneAndUpdate({ slug: TECH.DEFAULT_CLINIC_SLUG }, { $set: body })
      → revalidateTag(CACHE_TAGS.clinic)
      → revalidateTag(CACHE_TAGS.homepage)
      → auditAction({ action: "update", resource: "clinic" })
  Client:
    → SaveIndicator: saved
    → isDirty resets to false
    → Changes visible on public site after next ISR cycle (max 3600s for clinic)
```

---

## 10. ISR Revalidation Map

Every write must trigger the correct cache tags. This table is canonical:

| Write operation | Tags to revalidate |
|---|---|
| Clinic update | `clinic`, `homepage` |
| Homepage section update | `homepage` |
| Service create/update/delete | `services`, `homepage` |
| Doctor create/update/delete | `doctors`, `homepage` |
| Gallery create/update/delete | `gallery`, `homepage` |
| Blog publish/update/delete | `blog` |
| FAQ create/update/delete | `faq`, `homepage` |
| Review approve/reject | `reviews`, `homepage` |

**Never** call `revalidatePath("/")` — use specific tags only.

---

## 11. Audit Event Reference

All calls to `auditAction()` must use exactly these action/resource combinations:

| Action | Resource | Trigger |
|---|---|---|
| `create` | `service`, `doctor`, `gallery_item`, `blog_post`, `faq` | Entity created |
| `update` | All above + `clinic`, `review` | Any field change |
| `publish` | `service`, `doctor`, `blog_post`, `gallery_item`, `faq` | `isActive: true` or `status: "published"` |
| `archive` | `blog_post` | `status: "archived"` |
| `delete` | All content entities | Hard delete |

Auth events (`login_success`, `logout`, `password_changed`, etc.) are logged via `auditAuth()` — separate from CMS events.
