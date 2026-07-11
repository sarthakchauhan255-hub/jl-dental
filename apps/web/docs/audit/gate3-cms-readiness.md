# Gate 3 — CMS Readiness Pattern

## Pattern Enforced

```
Page (Server Component)
  → Server resolver (features/[domain]/server/get-*.ts)
      → DB query (Mongoose, .lean())
      → Mapper (features/[domain]/mappers/*.mapper.ts)
          → Zod schema validation (features/[domain]/schemas/*.schema.ts)
          → On parse failure or missing data → fallback (features/[domain]/fallback-data/*.fallback.ts)
  → Component receives only validated, typed content — never raw CMS shape
```

## Forbidden Pattern (not present anywhere in Phase 5)

```
page → component → static content   ❌
page → component → raw DB document  ❌
```

## Domains Implementing the Pattern

| Domain | Schema | Fallback | Mapper | Server Resolver |
|---|---|---|---|---|
| homepage (7 sections) | ✅ | ✅ | ✅ | ✅ `get-homepage-content.ts` |
| doctors | ✅ | ✅ | ✅ | ✅ `get-doctors.ts` |
| services | ✅ | ✅ | ✅ | ✅ `get-services.ts` |
| gallery | ✅ | ✅ | ✅ | ✅ `get-gallery.ts` |
| blog | ✅ | ✅ | ✅ | ✅ `get-blog-posts.ts` |
| faq | ✅ | ✅ | ✅ | ✅ `get-faqs.ts` |
| clinic (public) | ✅ | ✅ | ✅ | (uses existing `features/clinic/server/get-clinic.ts`) |

## Failure Behavior

Every mapper uses `schema.safeParse()` — never throws. Malformed or missing CMS data
silently resolves to fallback content. Pages never crash or render broken markup due to
CMS state. This satisfies the "graceful CMS fallback" requirement for empty/error states.

## Why This Matters Now

Phase 5 builds UI only — Phase 4's CMS write APIs are still stubs (501). This pattern
means Phase 5 components are already wired for real CMS data; when Phase 6+ fills in the
admin CRUD screens, **zero changes are needed in any public-facing component**. Only the
mapper's input source changes from `null` (no data yet) to actual Clinic/Doctor/Service
documents — which is already happening, since the server resolvers query real collections.
