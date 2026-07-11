# CMS API Contract

_Status: Pending approval. All API implementation must match this contract exactly._

---

## Global Conventions

### Authentication
Every admin API route requires a valid session. The JWT is in an `httpOnly SameSite=Strict`
cookie named `jl_auth_token`. No Bearer token in Authorization header.

### Response envelope
```typescript
// Success
{ success: true, data: T }
{ success: true, data: T[], pagination: { page, limit, total, totalPages } }

// Error
{ success: false, error: string, code?: string, fields?: Record<string, string> }
```

### HTTP status codes
| Code | Situation |
|---|---|
| 200 | Success with data |
| 201 | Created |
| 204 | Success, no content (DELETE) |
| 400 | Bad request (malformed) |
| 401 | Not authenticated |
| 403 | Authenticated but forbidden (RBAC) |
| 404 | Resource not found |
| 409 | Conflict (duplicate slug) |
| 422 | Validation error — includes `fields` |
| 429 | Rate limited |
| 500 | Server error |

### Pagination query params (all list endpoints)
| Param | Type | Default | Max |
|---|---|---|---|
| `page` | integer | 1 | — |
| `limit` | integer | 10 | 100 |
| `q` | string | — | 200 chars |
| `sort` | string | resource-specific | whitelist |
| `order` | `asc` \| `desc` | `desc` | — |

### ObjectId validation
All `[id]` path params are validated as 24-character hex strings before DB access.
Invalid format → 400, not 404 (avoids DB query on garbage input).

---

## Clinic API

### `GET /api/clinic`
Returns the current clinic configuration.

**Permission:** `clinic.read`

**Response 200:**
```typescript
{
  id:           string;
  name:         string;
  tagline?:     string;
  description?: string;
  contact: {
    phone?:            string;
    whatsapp?:         string;
    email?:            string;
    address?:          string;
    mapEmbedUrl?:      string;
    mapDirectionsUrl?: string;
  };
  workingHours: {
    [day in "monday"|"tuesday"|"wednesday"|"thursday"|"friday"|"saturday"|"sunday"]: {
      open:   string;  // HH:MM
      close:  string;
      closed: boolean;
    }
  };
  social: {
    instagram?:      string;
    facebook?:       string;
    googleBusiness?: string;
    whatsapp?:       string;
  };
  seo?: { defaultTitle?: string; defaultDescription?: string; };
  logo?: { url: string; publicId: string; alt?: string } | null;
}
```

---

### `PATCH /api/clinic`
Update clinic configuration. All fields optional (partial update).

**Permission:** `clinic.update`

**Request body:**
```typescript
{
  name?:        string;         // max 100
  tagline?:     string;         // max 200
  description?: string;         // max 2000
  contact?: {
    phone?:            string;  // max 20
    whatsapp?:         string;  // max 20
    email?:            string;  // valid email
    address?:          string;  // max 300
    mapEmbedUrl?:      string;  // URL or ""
    mapDirectionsUrl?: string;  // URL or ""
  };
  social?: {
    instagram?:      string;
    facebook?:       string;
    googleBusiness?: string;
    whatsapp?:       string;
  };
  seo?: {
    defaultTitle?:       string;  // max 70
    defaultDescription?: string;  // max 160
  };
}
```

**Response 200:** `{ id: string, name: string }`

**Revalidates:** `clinic`, `homepage`

---

## Doctors API

### `GET /api/doctors`
Paginated list of doctors.

**Permission:** `doctors.read`

**Query params:** `page`, `limit`, `q` (searches `name`, `specialization`)

**Response 200 (paginated):**
```typescript
data: Array<{
  id:             string;
  name:           string;
  slug:           string;
  specialization: string;
  isActive:       boolean;
  order:          number;
}>
```

---

### `POST /api/doctors`
Create a new doctor.

**Permission:** `doctors.create`

**Request body:**
```typescript
{
  name:            string;    // required, max 100
  slug:            string;    // required, /^[a-z0-9-]+$/, unique
  specialization:  string;    // required, max 100
  bio?:            string;    // max 3000
  qualifications?: string[];
  experience?:     number;    // integer >= 0
  languages?:      string[];
  isActive?:       boolean;   // default true
  order?:          number;    // default 0
  photo?:          { url: string; publicId: string } | null;
}
```

**Response 201:** `{ id: string, slug: string }`

**Revalidates:** `doctors`, `homepage`

---

### `GET /api/doctors/[id]`
Single doctor by ObjectId.

**Permission:** `doctors.read`

**Response 200:** Full doctor document.

---

### `PATCH /api/doctors/[id]`
Update doctor. All fields optional.

**Permission:** `doctors.update` (or `doctors.update.own` if `session.userId === doctor.userId`)

**Request body:** Same as POST, all optional.

**Response 200:** `{ id: string, name: string }`

**Revalidates:** `doctors`, `homepage`

---

### `DELETE /api/doctors/[id]`
Delete doctor permanently (Phase 6 hard delete).

**Permission:** `doctors.delete`

**Response 204:** No content.

**Revalidates:** `doctors`, `homepage`

---

## Services API

### `GET /api/services`
**Permission:** `services.read`
**Query:** `page`, `limit`, `q`, `isActive` (boolean filter)

**Response 200:** `{ id, name, slug, isActive, isFeatured, order }[]`

---

### `POST /api/services`
**Permission:** `services.create`

**Request body:**
```typescript
{
  name:        string;  // required, max 100
  slug:        string;  // required, /^[a-z0-9-]+$/, unique
  shortDesc:   string;  // required, max 300
  fullContent?: string; // max 10000
  icon?:        string; // max 50 — Lucide icon name
  isActive?:    boolean;
  isFeatured?:  boolean;
  order?:       number;
  coverImage?:  { url: string; publicId: string } | null;
  seo?: { title?: string; description?: string };
}
```

**Response 201:** `{ id, slug }`
**Revalidates:** `services`, `homepage`

---

### `GET /api/services/[id]`
**Permission:** `services.read`

**Response 200:** Full service document.

---

### `PATCH /api/services/[id]`
**Permission:** `services.update`

All body fields optional. Same shape as POST.

**Response 200:** `{ id, name }`
**Revalidates:** `services`, `homepage`

---

### `DELETE /api/services/[id]`
**Permission:** `services.delete`

**Response 204**
**Revalidates:** `services`, `homepage`

---

## Blog API

### `GET /api/blog`
**Permission:** `blog.read`
**Query:** `page`, `limit`, `q`, `status` (`draft` | `published` | `archived` | omit for all)

**Response 200:** `{ id, title, slug, status, category, publishedAt }[]`

---

### `POST /api/blog`
**Permission:** `blog.create`

**Request body:**
```typescript
{
  title:       string;  // required, max 200
  slug:        string;  // required, /^[a-z0-9-]+$/, max 220, unique
  excerpt?:    string;  // max 400
  content?:    string;  // max 50000
  status?:     "draft" | "published" | "archived"; // default "draft"
  category?:   string;  // max 60
  tags?:       string[]; // each max 40
  isFeatured?: boolean;
  coverImage?: { url: string; publicId: string } | null;
  publishedAt?: string | null; // ISO datetime — for backdated posts
  seo?: { title?: string; description?: string; canonical?: string };
}
```

**Response 201:** `{ id, slug }`
**Revalidates:** `blog`

---

### `GET /api/blog/[id]`
**Permission:** `blog.read`

**Response 200:** Full blog post document.

---

### `PATCH /api/blog/[id]`
**Permission:** `blog.update`

All body fields optional. Status transitions enforced server-side:
- `draft → published` ✅ — sets `publishedAt = now()` if not already set
- `published → archived` ✅
- `archived → draft` ✅
- `archived → published` ❌ — returns 422: `"Restore to draft first"`
- `published → draft` ❌ — returns 422: `"Archive first, then restore to draft"`

**Response 200:** `{ id, status }`
**Revalidates:** `blog`

---

### `DELETE /api/blog/[id]`
**Permission:** `blog.delete`

**Response 204**
**Revalidates:** `blog`

---

## Gallery API

### `GET /api/gallery`
**Permission:** `gallery.read`
**Query:** `page`, `limit`, `type` (`before_after` | `general`)

**Response 200:** `{ id, type, category, caption, isActive, order }[]`

---

### `POST /api/gallery`
**Permission:** `gallery.create`

**Request body:**
```typescript
{
  type:     "before_after" | "general";  // required
  category?: string;  // max 60
  caption?:  string;  // max 300
  altText?:  string;  // max 200
  isActive?: boolean;
  order?:    number;
  // For type = "before_after" — both required:
  before?:   { url: string; publicId: string };
  after?:    { url: string; publicId: string };
  // For type = "general" — required:
  image?:    { url: string; publicId: string };
}
```

**Validation:** Server enforces that `before_after` has both `before` + `after`; `general` has `image`.

**Response 201:** `{ id }`
**Revalidates:** `gallery`, `homepage`

---

### `PATCH /api/gallery/[id]`
**Permission:** `gallery.update`

**Response 200:** `{ id }`
**Revalidates:** `gallery`, `homepage`

---

### `DELETE /api/gallery/[id]`
**Permission:** `gallery.delete`

**Response 204**
**Revalidates:** `gallery`

---

## FAQ API

### `GET /api/faq`
**Permission:** `faq.read`
**Query:** `page`, `limit`, `q`, `category`, `isActive`

**Response 200:** `{ id, question, category, isActive, order }[]`

---

### `POST /api/faq`
**Permission:** `faq.create`

```typescript
{
  question:  string;  // required, max 300
  answer:    string;  // required, max 3000
  category?: string;  // max 60, default "General"
  isActive?: boolean;
  order?:    number;
}
```

**Response 201:** `{ id }`
**Revalidates:** `faq`, `homepage`

---

### `PATCH /api/faq/[id]`
**Permission:** `faq.update`

**Response 200:** `{ id }`
**Revalidates:** `faq`, `homepage`

---

### `DELETE /api/faq/[id]`
**Permission:** `faq.delete`

**Response 204**
**Revalidates:** `faq`

---

## Reviews API

### `GET /api/reviews`
**Permission:** `reviews.read`
**Query:** `page`, `limit`, `status` (`pending` | `approved` | `rejected` | `all`; default `pending`)

**Response 200:**
```typescript
data: Array<{
  id:          string;
  patientName: string;
  rating:      number;
  comment:     string;
  status:      string;
  isFeatured:  boolean;
  createdAt:   Date;
}>
```

---

### `PATCH /api/reviews?id=[id]`
Moderation action. Uses query param `id` (not path param — review endpoint has no [id] sub-route).

**Permission:** `reviews.update`

```typescript
{
  status?:     "pending" | "approved" | "rejected";
  isFeatured?: boolean;
  order?:      number;
}
```

**Response 200:** `{ id }`

---

## Uploads API

### `POST /api/uploads`
**Permission:** `media.upload` (checked via `canUploadMedia(session)`)

**Request:** `multipart/form-data`
| Field | Type | Required |
|---|---|---|
| `file` | File | Yes |
| `folder` | string | Yes — one of: `clinic`, `doctors`, `services`, `blog`, `gallery/before-after`, `gallery/general` |

**Validation:**
1. Folder must be in allowed whitelist
2. Magic byte verification (MIME spoofing prevention)
3. MIME type must match folder policy
4. File size within folder policy limit

**Response 200:**
```typescript
{
  url:      string;   // Cloudinary delivery URL
  publicId: string;   // Store this in the entity document
  width?:   number;
  height?:  number;
  warning?: string;   // e.g. "File is unusually small"
}
```

**Error cases:**
- Invalid folder → 400
- MIME violation (magic bytes don't match declared type) → 422
- File too large → 422
- Cloudinary failure → 502

---

## Homepage Sections API

### `PATCH /api/clinic/homepage` _(Phase 7 — not yet implemented)_

Updating individual homepage sections will be handled via a dedicated endpoint:

```typescript
PATCH /api/clinic/homepage
{
  section: "hero" | "servicesPreview" | "doctorsPreview" | "ctaBlock" | "faqPreview" | "galleryPreview" | "testimonials";
  data:    Record<string, unknown>;  // section-specific fields
}
```

**Permission:** `clinic.update`

For Phase 6, homepage section editing is done via the Clinic Settings PATCH endpoint (same `clinic.update` permission).

---

## Error Reference

| Code | Meaning | When |
|---|---|---|
| `INVALID_CREDENTIALS` | Wrong email/password | Auth routes only |
| `SESSION_EXPIRED` | JWT invalid or tokenVersion mismatch | Any route requiring session |
| `ACCOUNT_INACTIVE` | Account deactivated | Login |
| `RESET_TOKEN_EXPIRED` | Reset link invalid/used/expired | Password reset |
| `VALIDATION_ERROR` | Zod parse failure | Any route with body/query validation |
| `NOT_FOUND` | Document not found in DB | GET/PATCH/DELETE by ID |
| `FORBIDDEN` | Authenticated but missing permission | Any permissioned route |
| `INTERNAL_ERROR` | Unhandled server error | Catch-all |

All error responses include the `code` field alongside `error` (human-readable message).
