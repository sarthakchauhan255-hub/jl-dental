# Media / Upload Certification — Phase 4.75

---

## Upload Pipeline (Single Path)

```
Admin (browser)
  → POST /api/uploads  (FormData: file + folder)
  → requireSession()   auth gate
  → canUploadMedia()   RBAC check
  → folder whitelist   VALID_FOLDERS array
  → getPolicyForFolder()  per-context constraints
  → validateUpload()   magic bytes + mime + size
  → uploadToCloudinary()  server-side only, never client
  → MediaPendingCleanup.create()  orphan tracking
  → return { url, publicId, width, height, warning? }
```

## Checklist

| Control | Status | Evidence |
|---|---|---|
| Single upload path | ✅ | Only `app/api/uploads/route.ts` handles uploads |
| No route-side validation | ✅ | All validation in `lib/uploads/validate.ts` |
| No unsafe MIME trust | ✅ | Magic byte check in `validateUpload()` |
| Cloudinary server-only | ✅ | SDK in `lib/media/cloudinary.ts` — no public presets |
| Orphan cleanup path | ✅ | `MediaPendingCleanup.create()` after every upload |
| Policy centralized | ✅ | `lib/uploads/policies.ts` — per folder: mime, size, aspect, transforms |
| URL construction centralized | ✅ | `lib/media/cloudinary-url.ts` — no manual string building in components |
| Delete tracked | ✅ | `deleteFromCloudinary(publicId)` in `lib/media/cloudinary.ts` |

## Per-Folder Policies

| Folder | Allowed Types | Max Size | Aspect Ratio | Transform |
|---|---|---|---|---|
| clinic | jpg/png/webp | 5MB | free | none |
| doctors | jpg/png/webp | 5MB | 3:4 | fill, gravity:face |
| services | jpg/png/webp | 8MB | 16:9 | fill 1600×900 |
| blog | jpg/png/webp | 8MB | 16:9 | fill 1600×900 |
| gallery/before-after | jpg/png/webp | 10MB | 4:3 | fill 1200×900 |
| gallery/general | jpg/png/webp | 10MB | free | none |

## Remaining Items

1. **Orphan cleanup cron** — `MediaPendingCleanup` records created on every upload.
   Cron job to process them: Phase 7 (Notifications/Cron).

2. **Delete endpoint** — `deleteFromCloudinary()` exists in media service.
   `/api/uploads/[publicId]` DELETE route: Phase 4 stub, implemented Phase 5.

## MEDIA CERTIFICATION: PASS ✅
