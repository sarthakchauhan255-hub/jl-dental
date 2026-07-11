# CMS Domain Model

_Status: Pending approval. No implementation proceeds until this document is approved._

This document is the authoritative source of truth for every CMS entity in the platform.
All API design, UI behaviour, and validation logic must comply with the rules defined here.

---

## 1. Clinic

### Entity Ownership
Owned by `superadmin` and `admin`. One Clinic document per deployment (single-clinic phase).
Identified by `TECH.DEFAULT_CLINIC_SLUG` — never by ObjectId in public routes.

### Lifecycle States
Clinic is perpetual — no lifecycle states. It cannot be created or deleted through the CMS.
Only `PATCH` (update) is permitted. The seed script creates the initial document.

### Relationships
- Parent of: Doctor, Service, BlogPost, Gallery, FAQ, Review, Appointment (all reference `clinicId`)
- Owns: homepage section configuration (embedded subdocument)
- Owns: SEO defaults used as fallback for all public pages

### Required Fields
| Field | Type | Constraint |
|---|---|---|
| `slug` | string | unique, kebab-case, set at seed time — never changeable through CMS |
| `name` | string | max 100 chars |

### Optional Fields
| Field | Type | Notes |
|---|---|---|
| `tagline` | string | max 200 chars |
| `description` | string | max 2000 chars — used for About section and SEO |
| `contact.phone` | string | max 20 chars |
| `contact.whatsapp` | string | max 20 chars — separate from phone |
| `contact.email` | string | valid email format |
| `contact.address` | string | max 300 chars — full address block |
| `contact.mapEmbedUrl` | string | valid URL — Google Maps embed src |
| `contact.mapDirectionsUrl` | string | valid URL — "Get Directions" link target |
| `workingHours.*` | DayHours | per-day `open`, `close` (HH:MM), `closed` boolean |
| `social.instagram` | string | full URL |
| `social.facebook` | string | full URL |
| `social.googleBusiness` | string | full URL |
| `social.whatsapp` | string | WhatsApp link URL |
| `logo` | MediaAsset | `{ url, publicId, alt }` |
| `seo.defaultTitle` | string | max 70 chars — fallback title for all pages |
| `seo.defaultDescription` | string | max 160 chars — fallback description |
| `homepage.*` | object | embedded homepage section configuration |

### Validation Rules
- `contact.email` — validate format; reject invalid on PATCH
- `contact.mapEmbedUrl` — must be URL if provided; empty string is allowed (treated as not set)
- `workingHours.*.open/close` — HH:MM format (24h); `close` must be after `open` unless `closed: true`
- `slug` — read-only after creation; PATCH must reject attempts to change it

### SEO Ownership
Clinic owns the default SEO fallback. Individual pages (services, blog, doctors) may override.
`seo.defaultTitle` becomes the `%s | {defaultTitle}` template used by `lib/seo.ts`.

### Media Ownership
`logo` — single asset. Replacing it orphans the previous `publicId`. Phase 7 cleanup cron handles orphan deletion.

### Soft Delete
Not applicable. Clinic is permanent.

### Restore
Not applicable.

### Future Extensibility
- `branches: Branch[]` — array of branch subdocuments for multi-branch expansion
- `timezone` field for non-IST deployments
- `locale` field for multilingual support
- `themeOverrides` for per-clinic color customization (Phase B multi-clinic)

---

## 2. Homepage

### Entity Ownership
Owned by `superadmin` and `admin`. Embedded inside the Clinic document as `clinic.homepage`.
Not a standalone collection — it is the CMS configuration layer over the homepage.

### Lifecycle States
No lifecycle. Homepage is always live. Individual sections can be toggled via `enabled: boolean`.

### Sections (all optional, all togglable)

| Section key | Controls |
|---|---|
| `hero` | Headline, subheadline, CTA label/href, background image |
| `servicesPreview` | Title, subtitle, `maxDisplay` (1–12) |
| `doctorsPreview` | Title, subtitle |
| `testimonials` | Title, subtitle |
| `galleryPreview` | Title, subtitle |
| `faqPreview` | Title |
| `ctaBlock` | Headline, button label/href |

### Required Fields (per section)
Each section requires only its `enabled` boolean. All content fields have safe defaults.

### Validation Rules
- `hero.ctaHref` — must be a relative path (`/book`) or valid URL
- `servicesPreview.maxDisplay` — integer 1–12
- Section content is not required — missing fields resolve to fallback data (never crash)

### Relationships
- Reads from: Services (preview), Doctors (preview), Gallery (preview), FAQ (preview), Reviews (testimonials)
- Owned by: Clinic document

### SEO Ownership
Homepage SEO title/description sourced from Clinic `seo.defaultTitle` / `seo.defaultDescription`.
No per-section SEO fields.

### Media Ownership
`hero.image` — single background image asset.

### Future Extensibility
- Section ordering (drag-and-drop order field per section)
- Scheduled visibility (show section between date A and date B)
- A/B testing configuration per section
- Statistics section: patient count, years of experience, etc.

---

## 3. Services

### Entity Ownership
Owned by `admin` and `content_manager` (update only — create/delete restricted to `admin`).
Each service belongs to one Clinic via `clinicId`.

### Lifecycle States

```
active (isActive: true)   ←→   inactive (isActive: false)
```

No draft/published distinction. A service is either shown on the site or not.

### Publish Workflow
- Create → `isActive: true` by default → immediately live on next ISR cycle (3600s max delay)
- Toggle: `PATCH { isActive: false }` → removed from public listing
- Toggle: `PATCH { isActive: true }` → restored to public listing

### Archive Workflow
No separate archive state. `isActive: false` is the inactive state.
Soft delete (Phase 7+): `deletedAt` timestamp + filter from all queries.

### Relationships
- Belongs to: Clinic (`clinicId`)
- Referenced by: Appointment (patient selects a service when booking)
- Displayed on: Homepage services preview, /services list, /services/[slug] detail

### Required Fields
| Field | Constraint |
|---|---|
| `name` | min 1, max 100 chars |
| `slug` | min 1, max 120; `/^[a-z0-9-]+$/`; unique |
| `shortDesc` | min 1, max 300 chars |

### Optional Fields
| Field | Constraint |
|---|---|
| `icon` | max 50 chars — Lucide icon name or custom identifier |
| `fullContent` | max 10,000 chars — rich text (plain text for Phase 6, editor in Phase 7+) |
| `coverImage` | MediaAsset `{ url, publicId }` |
| `isFeatured` | boolean — used for homepage featured display |
| `order` | integer — display ordering, lower = earlier |
| `seo.title` | max 70 chars |
| `seo.description` | max 160 chars |
| `seo.ogImage` | MediaAsset |

### Validation Rules
- `slug` — auto-generated from `name` on create if not provided; validated `/^[a-z0-9-]+$/`; unique enforced at DB level
- `slug` — immutable after first publish (URL stability)
- `icon` — any string; validated client-side against Lucide icon list; falls back gracefully if unknown

### Searchable Fields
`name`, `shortDesc`, `fullContent`

### Sortable Fields
`name`, `order`, `createdAt`, `updatedAt`

### Filterable Fields
`isActive`, `isFeatured`, `clinicId`

### SEO Ownership
Each service has its own `seo` subdocument. Falls back to Clinic `seo.defaultTitle/Description` if not set.

### Media Ownership
`coverImage` — single asset. `seo.ogImage` — single asset. Both orphaned on replace; cleanup in Phase 7.

### Soft Delete
Phase 6: hard delete (`findByIdAndDelete`).
Phase 7+: add `deletedAt: Date | null` field; filter `{ deletedAt: null }` in all queries.

### Restore
Phase 7+: `PATCH { deletedAt: null }` — restores to inactive state, admin must re-activate.

### Future Extensibility
- `categories: string[]` — service taxonomy
- `relatedServices: ObjectId[]` — cross-linking
- `pricingTiers` — pricing display
- `duration` — treatment time in minutes
- `beforeAfterGallery: ObjectId[]` — linked gallery items

---

## 4. Doctors

### Entity Ownership
Owned by `admin` (create/delete). Doctors can update their own profile via `doctors.update.own`.
Each doctor belongs to one Clinic via `clinicId`. Optionally linked to a User account via `userId`.

### Lifecycle States

```
active (isActive: true)   ←→   inactive (isActive: false)
```

### Publish Workflow
Same as Services — `isActive` toggle, ISR revalidation on change.

### Archive Workflow
Same as Services.

### Relationships
- Belongs to: Clinic (`clinicId`)
- Optionally linked to: User (`userId`) — for future login access to own schedule
- Referenced by: Appointment (assigned doctor)
- Displayed on: Homepage doctors preview, /doctors list, /doctors/[slug] detail

### Required Fields
| Field | Constraint |
|---|---|
| `name` | min 1, max 100 chars |
| `slug` | unique, `/^[a-z0-9-]+$/` |
| `specialization` | min 1, max 100 chars |

### Optional Fields
| Field | Constraint |
|---|---|
| `photo` | MediaAsset `{ url, publicId, alt }` — 3:4 aspect enforced by upload policy |
| `bio` | max 3000 chars |
| `qualifications` | `string[]` — e.g. `["BDS", "MDS - Orthodontics"]` |
| `experience` | integer — years of experience |
| `languages` | `string[]` — e.g. `["English", "Hindi"]` |
| `order` | integer — display ordering |
| `userId` | ObjectId ref to User — for future self-service profile editing |

### Validation Rules
- `slug` — immutable after first activation (URL stability)
- `photo` — aspect ratio 3:4 enforced at upload (not at model level; upload policy gates this)
- `experience` — non-negative integer

### Searchable Fields
`name`, `specialization`, `bio`

### Sortable Fields
`name`, `order`, `experience`, `createdAt`

### Filterable Fields
`isActive`, `specialization`, `clinicId`

### SEO Ownership
Doctor detail page SEO: `name` + `specialization` used to build title. No per-doctor SEO fields in Phase 6.
Phase 7+: add `seo` subdocument.

### Media Ownership
`photo` — single asset. Upload policy enforces 3:4 aspect, max 5MB.

### Soft Delete / Restore
Same pattern as Services.

### Future Extensibility
- `availability` — weekly schedule for appointment booking
- `consultationFee` — pricing
- `certificates: MediaAsset[]` — uploaded credential images
- `videoIntroUrl` — embedded video
- Self-service profile editing via `userId` link

---

## 5. Gallery

### Entity Ownership
Owned by `admin` and `content_manager`. Each item belongs to one Clinic.

### Lifecycle States

```
active (isActive: true)   ←→   inactive (isActive: false)
```

### Types
Two distinct gallery types share one collection with a `type` discriminator:

| Type | Required media | Description |
|---|---|---|
| `before_after` | `before` + `after` MediaAsset | Comparison slider — both sides required |
| `general` | `image` MediaAsset | Standard gallery image |

### Publish Workflow
Create → `isActive: true` by default → live immediately after ISR cycle.

### Relationships
- Belongs to: Clinic (`clinicId`)
- Displayed on: Homepage gallery preview, /gallery page
- Future: linked from Service pages (`relatedGallery`)

### Required Fields
| Field | Constraint |
|---|---|
| `type` | `"before_after"` or `"general"` |

**When `type = "before_after"`:**
| Field | Constraint |
|---|---|
| `before` | MediaAsset — required |
| `after` | MediaAsset — required |

**When `type = "general"`:**
| Field | Constraint |
|---|---|
| `image` | MediaAsset — required |

### Optional Fields
| Field | Constraint |
|---|---|
| `category` | string, max 60 chars, default `"General"` |
| `caption` | string, max 300 chars |
| `altText` | string, max 200 chars — accessibility |
| `order` | integer |
| `serviceId` | ObjectId — future link to related Service |

### Validation Rules
- `before_after` items must have both `before` AND `after`; reject if either is missing
- `general` items must have `image`; reject if missing
- Cross-type validation: `before` + `after` fields are ignored if `type = "general"` and vice versa

### Searchable Fields
`caption`, `category`, `altText`

### Sortable Fields
`order`, `createdAt`, `category`

### Filterable Fields
`type`, `category`, `isActive`, `clinicId`

### SEO Ownership
No per-item SEO. Gallery page SEO owned by Clinic defaults.

### Media Ownership
- `before_after`: two assets (`before.publicId`, `after.publicId`)
- `general`: one asset (`image.publicId`)
All assets orphaned on item delete — Phase 7 cleanup cron handles deletion from Cloudinary.

### Soft Delete / Restore
Same pattern as Services.

### Future Extensibility
- `tags: string[]` — cross-searchable descriptors
- AI-generated alt text
- Patient consent tracking (`consentGiven: boolean`, `consentDate: Date`)
- `serviceId` link for contextual gallery on service pages

---

## 6. Blog

### Entity Ownership
Owned by `admin` and `content_manager`. A blog post records its author as the creating user's userId.

### Lifecycle States

```
draft  ──publish──►  published  ──archive──►  archived
  ▲                      │
  └─────unpublish─────────┘
```

### Publish Workflow
1. Create → `status: "draft"` — not visible on public site
2. `PATCH { status: "published" }` → sets `publishedAt = now()` → visible after ISR cycle
3. Published posts appear on `/blog` and `/blog/[slug]`

### Archive Workflow
1. `PATCH { status: "archived" }` → removed from public listing; URL returns 404
2. Archived posts are retained in DB for restoration
3. `PATCH { status: "draft" }` → restore to draft (no `publishedAt` change)

### Relationships
- Belongs to: Clinic (`clinicId`)
- Author: User (`authorId` stored as ObjectId; display name stored as `author` string for denormalization)
- Displayed on: /blog list, /blog/[slug] detail

### Required Fields
| Field | Constraint |
|---|---|
| `title` | min 1, max 200 chars |
| `slug` | unique, `/^[a-z0-9-]+$/`, max 220 chars |

### Optional Fields
| Field | Constraint |
|---|---|
| `excerpt` | max 400 chars — used in list cards and SEO description fallback |
| `content` | max 50,000 chars — body content |
| `coverImage` | MediaAsset |
| `category` | string, max 60 chars, default `"General"` |
| `tags` | `string[]`, each max 40 chars |
| `isFeatured` | boolean — used for featured post highlight |
| `seo.title` | max 70 chars |
| `seo.description` | max 160 chars |
| `seo.canonical` | valid URL — for syndicated content |
| `publishedAt` | datetime — auto-set on publish; can be set in past for backdated posts |
| `author` | string, max 100 chars — display name (denormalized from User) |

### Validation Rules
- `slug` — immutable after first publish (URL stability)
- `publishedAt` — read-only after first publish (cannot be changed without re-archiving)
- `status` transitions enforced: `draft → published`, `published → archived`, `archived → draft` only
- Invalid transitions (e.g. `archived → published`) are rejected with 422

### Searchable Fields
`title`, `excerpt`, `content`, `tags`, `category`, `author`

### Sortable Fields
`publishedAt`, `createdAt`, `updatedAt`, `title`

### Filterable Fields
`status`, `category`, `isFeatured`, `authorId`, `clinicId`

### SEO Ownership
Each post has its own `seo` subdocument. `excerpt` used as SEO description fallback.
`publishedAt` exposed as `datePublished` in Article JSON-LD.

### Media Ownership
`coverImage` — single asset. `seo.ogImage` — separate asset (Phase 7).

### Soft Delete / Restore
Phase 6: hard delete. Phase 7+: `deletedAt` field + restore workflow.

### Future Extensibility
- Rich text editor (TipTap / ProseMirror) replacing plain text `content`
- `scheduledAt` — future publish scheduling
- Reading time auto-calculation from `content`
- `relatedPosts: ObjectId[]`
- Multi-author support

---

## 7. FAQ

### Entity Ownership
Owned by `admin` and `content_manager`.

### Lifecycle States

```
active (isActive: true)   ←→   inactive (isActive: false)
```

### Publish Workflow
Create → `isActive: true` by default → visible immediately after ISR cycle.

### Relationships
- Belongs to: Clinic (`clinicId`)
- Displayed on: Homepage FAQ preview (first 5), /faq full page

### Required Fields
| Field | Constraint |
|---|---|
| `question` | min 1, max 300 chars |
| `answer` | min 1, max 3000 chars |

### Optional Fields
| Field | Constraint |
|---|---|
| `category` | string, max 60 chars, default `"General"` — used for accordion grouping |
| `order` | integer — display order within category |

### Validation Rules
- `question` and `answer` both required — FAQ with one or the other is invalid
- `order` — non-negative integer

### Searchable Fields
`question`, `answer`, `category`

### Sortable Fields
`order`, `category`, `createdAt`

### Filterable Fields
`isActive`, `category`, `clinicId`

### SEO Ownership
FAQ page uses FAQPage JSON-LD structured data. Each active FAQ item is included in schema.
Page-level SEO owned by Clinic defaults.

### Soft Delete / Restore
Same pattern as Services.

### Future Extensibility
- `translations: Record<string, { question: string; answer: string }>` — multilingual support
- Patient-submitted questions (moderation queue → FAQ creation)
- `helpful: number` — upvote count for sorting by usefulness

---

## 8. Testimonials (Reviews)

### Entity Ownership
Reviews are submitted by patients (public form — Phase 7). Moderated by `admin` and `content_manager`.
Not created through the CMS — only moderated.

### Lifecycle States

```
pending  ──approve──►  approved
   └─────reject──────►  rejected

approved ◄──re-approve──  rejected   (admin can reverse moderation decision)
```

### Moderation Workflow
1. Patient submits review via public form (Phase 7) → `status: "pending"`
2. Admin reviews in CMS → `PATCH { status: "approved" }` or `PATCH { status: "rejected" }`
3. Approved reviews appear on homepage testimonials section
4. Admin may toggle `isFeatured: true` to prioritize in display
5. Admin may reverse: `PATCH { status: "rejected" }` on a previously approved review

### Relationships
- Belongs to: Clinic (`clinicId`)
- Optionally linked to: Appointment (source of verified review)
- Displayed on: Homepage testimonials section (approved + featured first)

### Required Fields (set by patient submission, not CMS)
| Field | Constraint |
|---|---|
| `patientName` | min 1, max 100 chars |
| `rating` | integer 1–5 |
| `comment` | min 10, max 1000 chars |

### Optional Fields
| Field | Constraint |
|---|---|
| `isFeatured` | boolean — admin toggle |
| `order` | integer — display ordering override |
| `source` | string — `"website"`, `"google"`, `"facebook"` |
| `patientPhoto` | MediaAsset — patient-provided (Phase 7+) |
| `serviceId` | ObjectId — which service the review is about (Phase 7+) |
| `appointmentId` | ObjectId — verified review from appointment |

### Validation Rules (CMS moderation)
- Only `status`, `isFeatured`, `order` can be modified through CMS
- Patient-submitted fields (`patientName`, `rating`, `comment`) are immutable after submission

### Searchable Fields
`patientName`, `comment`

### Sortable Fields
`rating`, `createdAt`, `order`

### Filterable Fields
`status`, `isFeatured`, `rating`, `source`, `clinicId`

### SEO Ownership
Reviews contribute to `aggregateRating` in DentistSchema JSON-LD (Phase 7).

### Media Ownership
`patientPhoto` — Phase 7. Patient-uploaded, moderated by admin.

### Soft Delete
Reviews are never hard-deleted. `status: "rejected"` is the suppression state.
Permanent removal requires `superadmin` only.

### Restore
`PATCH { status: "approved" }` on a rejected review restores it.

### Future Extensibility
- Google Business / external review import
- `verified: boolean` — linked to confirmed appointment
- NPS score tracking
- Reply from clinic (`clinicReply: string`)

---

## 9. Media (MediaPendingCleanup)

### Entity Ownership
System-managed. Created automatically on every Cloudinary upload. Not directly editable through CMS.

### Lifecycle States (state machine)

```
pending ──────► retrying ──────► cleaned (terminal)
   │                │
   │                └────────► failed  (terminal until manual retry)
   │
   └──────────────────────────► cleaned (direct success)

failed ──────► retrying  (manual superadmin trigger only)
```

### Lifecycle Rules
- Every upload creates a `pending` record regardless of outcome
- When the owning entity document is saved with this `publicId`, the record should be cleaned (Phase 7 cron)
- When an entity is deleted, its assets move to `pending` for deletion from Cloudinary
- After 3 failed attempts → `failed`; after 7 days → TTL auto-expires document

### Required Fields
| Field | Constraint |
|---|---|
| `publicId` | unique Cloudinary public ID |
| `folder` | upload folder name |
| `reason` | `"abandoned_upload"` \| `"entity_save_failed"` \| `"image_replaced"` \| `"entity_deleted"` |

### Optional Fields
| Field | Notes |
|---|---|
| `uploadedBy` | ObjectId ref to User |
| `relatedResource` | string — entity type (e.g. `"doctor"`) |
| `relatedResourceId` | string — entity ID |

### Soft Delete
Not applicable — this collection tracks deletion, not performs it.

### Future Extensibility
- Duplicate detection (perceptual hash comparison)
- Media library UI (Module 10 — Phase 7)
- Alt text storage centralized in media records
- Usage tracking across all entity references
