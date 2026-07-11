# JL Dental Platform — Foundation Freeze

_Completed: Phase 5.3_
_Status: LOCKED. This document is the official baseline for all future development._

All conventions, patterns, and architectural decisions documented here are
binding. Changes require explicit approval and a corresponding update to this document.

---

## 1. Final Architecture Summary

The platform is a **Next.js 14 App Router** monorepo with a strict server-first
architecture. The public website is CMS-driven via a provider abstraction.
The admin panel is auth-gated via JWT with `tokenVersion` invalidation.
All infrastructure identifiers and display branding are separated into distinct config files.

**Stack (locked):**
- Framework: Next.js 14 App Router, TypeScript strict
- Styling: Tailwind CSS + shadcn/ui + Framer Motion (client islands only)
- Database: MongoDB Atlas via Mongoose
- Auth: JWT in httpOnly SameSite=Strict cookies + Upstash Redis rate limiting
- Media: Cloudinary (server-side only, magic-byte validation)
- Email: Resend
- Deployment: Vercel

---

## 2. Locked Project Conventions

### Server / Client boundary
- Every component is a Server Component unless it requires: `useState`, `useEffect`,
  browser APIs, event handlers, or third-party libraries requiring browser context.
- `"use client"` wraps only the smallest necessary leaf — never pages or layouts.
- Framer Motion is confined to client islands. Pages and layouts are never wrapped
  in motion components.

### Import rules
- All imports use `@/` absolute aliases — no relative imports across domain boundaries.
- Domain barrel exports (`@/lib/auth`, `@/lib/api`) are preferred over deep imports.
- Scripts running via `npx tsx` (outside Next.js) may use relative paths.

### Naming
- Components: `PascalCase.tsx`
- Utilities: `kebab-case.ts`
- Server resolvers: `get-{resource}.ts`
- Constants: `SCREAMING_SNAKE_CASE`
- Config objects: `PascalCase` keys

---

## 3. Branding Architecture

### Separation rule
```
config/branding.ts   → display identity only (names, copy, colors, logos)
config/technical.ts  → system identifiers only (slugs, prefixes, service IDs)
```

### BRAND constants (config/branding.ts)
All display strings: `NAME`, `SHORT_NAME`, `TAGLINE`, `CITY`, `STATE`, `LOCATION`,
`SUPPORT_EMAIL`, `DEFAULT_TITLE`, `DEFAULT_DESC`, `TITLE_SUFFIX`, `BLOG_SUFFIX`,
`ADMIN_LABEL`, `WHATSAPP_MSG`, `COPYRIGHT_SUFFIX`, `ORG_SCHEMA_NAME`, `OG_TITLE`,
`THEME_COLOR_LIGHT/DARK`, `LOGO_ALT`, `AUTHOR`

### TECH constants (config/technical.ts)
All infrastructure IDs: `APP_SLUG`, `CLOUDINARY_PREFIX`, `DEFAULT_UPLOAD_TAG`,
`DEFAULT_CLINIC_SLUG`, `DB_DEFAULT_SUFFIX`, `LOGGER_SERVICE_NAME`, `EMAIL_FROM_NAME`

### Logo rule
No component imports logo assets directly. All renders go through `BrandLogo` component
or `getBrandAssets()`. Variant selection follows the rules in `docs/brand-architecture.md`.

### Validator
`npx tsx scripts/check-brand.ts` — scans 10 directories, 5 categories.
Must pass before every merge. Add to CI.
Escape hatch: `// brand-ok` for Next.js metadata constraint and seed scripts.

---

## 4. Technical Architecture

### Config files
```
config/branding.ts    Display identity
config/technical.ts   Infrastructure identifiers
```

### Lib domains
```
lib/auth/             JWT session, RBAC, permission helpers, typed auth errors
lib/api/              Response helpers, error handler, pagination, query, validators, wrappers
lib/db/               Mongoose connection (lazy), DB helpers
lib/media/            Cloudinary upload/delete, URL builder
lib/security/         Origin validation, rate limiting, IP extraction, safe redirect
lib/notifications/    Email (Resend), WhatsApp stub, SMS stub
lib/constants/        App constants, routes, roles, statuses, SEO, auth
lib/cache.ts          ISR revalidation constants and cache tags
lib/logger.ts         Structured logging (dev: formatted, prod: JSON)
lib/seo.ts            Metadata helpers, JSON-LD builders
```

### Auth service layer
Business logic is isolated in `lib/auth/services/` — routes are thin handlers only:
- `credentials.ts` — timing-safe validation (always runs bcrypt), `recordLogin`
- `reset.ts` — `crypto.randomBytes(32)`, sha256 stored, `timingSafeEqual` comparison

### Security controls
- Dummy hash prevents timing-based user enumeration
- `tokenVersion` in JWT — DB check in `requireSession()`, incremented on password change/reset
- Origin validation on all mutation auth routes
- Rate limiting: IP + email axes on login, IP axis on reset
- Generic error messages throughout auth paths
- Log sanitization: scrubs password, token, hash, secret, cookie, jwt keys

---

## 5. CMS Architecture

### Pattern (enforced, no exceptions in public layer)
```
Page (Server Component)
  → getCmsProvider()
    → MongoCmsProvider  (MONGODB_URI set)
    → LocalFallbackProvider  (no DB)
  → mapper (schema.safeParse → fallback on failure)
  → schema (Zod)
  → component (typed props only)
```

### CmsProvider contract
`features/shared/cms/contracts/cms-provider.contract.ts` — all public data access
goes through this interface. Components never see raw DB documents.

### Providers
- `MongoCmsProvider` — production, delegates to feature server resolvers
- `LocalFallbackProvider` — development/CI, returns safe empty/default data
- `getCmsProvider()` — single injection point, module-level singleton

### Server resolvers
`features/*/server/get-*.ts` — only location where `connectDB()` and Mongoose models
are imported. Public pages never import these directly (exception: `generateStaticParams()`
which runs at build time, not request time — documented accepted exception).

### Fallback behaviour
Every mapper uses `schema.safeParse()`. Malformed or missing CMS data silently
resolves to typed fallback content. Pages never crash due to CMS state.

---

## 6. Security Architecture

### Trust boundaries
- HTTP request body: Zod parse before any use (`parseBody()` in `lib/api/validators.ts`)
- URL params: whitelist validation via `parseObjectId()` and `parseQuery()`
- DB results: typed via Mongoose lean objects + mapper schemas
- JWT payload: `parseSessionPayload()` Zod validation before use
- File uploads: magic-byte check + policy enforcement before Cloudinary

### Auth flow
```
Login:
  Origin check → IP rate limit → email rate limit →
  validateCredentials() [always bcrypt] → createToken() → setAuthCookie() →
  recordLogin() → auditAuth()

Session validation (every admin API call):
  Middleware: jwtVerify() [fast, no DB]
  requireSession(): jwtVerify() → parseSessionPayload() → DB tokenVersion check

Password reset:
  crypto.randomBytes(32) → sha256 stored → raw token in email →
  incoming sha256 → timingSafeEqual → applyPasswordReset() → tokenVersion increment
```

### Cookie spec
`httpOnly: true, secure: production, sameSite: "strict", maxAge: 7 days`

---

## 7. Provider Architecture

### CMS provider
See Section 5. Single `getCmsProvider()` call per request.

### Rate limiter
`lib/security/rate-limit.ts` — lazy-initialized Ratelimit getters (avoids Upstash build warning).
Named limiters: `auth`, `appointments`, `reviews`, `mediaUpload`, `api`.

### DB connection
`lib/db/connection.ts` — Mongoose singleton, lazy connect, serverless-safe.
Throws at call time (not module load) — build-safe.

---

## 8. Folder Architecture

```
apps/web/
├── app/
│   ├── (public)/          Public website routes — CmsProvider only, no DB imports
│   ├── (admin)/admin/     Admin UI routes — requireSession() server-side
│   └── api/               API route handlers — thin, delegate to services
├── components/
│   ├── admin/             Admin UI components (sidebar, header)
│   ├── common/            Shared components (BrandLogo, OptimizedImage, motion, etc.)
│   ├── icons/             Inline SVG icon components (no external icon CDN)
│   ├── states/            EmptyState, ErrorState, LoadingState
│   └── ui/                shadcn/ui primitives
├── config/
│   ├── branding.ts        Display identity — BRAND constants, getBrandAssets(), BRAND_COLORS
│   └── technical.ts       Infrastructure identifiers — TECH constants
├── context/
│   └── auth-context.tsx   Client-side session state (UI convenience only)
├── docs/                  Architecture documentation
├── features/
│   ├── appointment/       Public booking form (Phase 5 shell — Phase 6 wires submission)
│   ├── auth/              Admin login components + permission hooks
│   ├── blog/              Schema, mapper, fallback, server resolver, components
│   ├── clinic/            Schema, mapper, fallback, server resolver
│   ├── doctors/           Schema, mapper, fallback, server resolver, components
│   ├── faq/               Schema, mapper, fallback, server resolver, components
│   ├── gallery/           Schema, mapper, fallback, server resolver, adapters, components
│   ├── homepage/          7 section schemas + mappers + fallbacks + server resolver + components
│   ├── services/          Schema, mapper, fallback, server resolver
│   └── shared/
│       ├── cms/           CmsProvider contract, providers, resolver, fallback data
│       ├── components/    Navbar, Footer, WhatsApp, mobile menu, scroll wrapper, dropdown
│       ├── mappers/       (shared map utilities)
│       └── schemas/       (shared schema base fragments)
├── lib/
│   ├── api/               Response helpers, error handler, pagination, query, validators, wrappers
│   ├── auth/              Session, RBAC, permissions, token schema, errors, services/
│   ├── constants/         App, auth, routes, roles, SEO, statuses
│   ├── db/                Connection, helpers
│   ├── media/             Cloudinary upload/delete, URL builder
│   ├── notifications/     Email, WhatsApp stub, SMS stub
│   └── security/          Origin, rate-limit, errors, request utilities
├── models/                Mongoose models (all schema definitions)
├── public/
│   ├── branding/          Logo SVGs, favicon assets
│   └── fonts/             Self-hosted variable fonts (Inter, Playfair Display)
├── scripts/               CLI utilities (seed-admin, verify-indexes, check-brand)
└── types/                 Global TypeScript types
```

**Rules:**
- Never create folders outside this structure without explicit approval
- Never duplicate existing folder responsibilities
- Feature folders always contain: `schemas/`, `mappers/`, `fallback-data/`, `server/`, `components/`

---

## 9. Validation Architecture

### Request validation
All route handlers use `lib/api/validators.ts`:
- `parseBody(req, schema)` — Zod, throws `ValidationError`
- `parseQuery(params, schema)` — Zod on URLSearchParams
- `parseObjectId(value)` — hex regex, throws `ValidationError`

### Schema location
All Zod schemas: `lib/validations/index.ts` (API schemas) + `features/*/schemas/` (CMS schemas).
No inline Zod schemas in route handlers.

### Error mapping
`handleRouteError()` in `lib/api/errors.ts` — maps ZodError → 422, AppError → status code,
unknown → 500. Never exposes stack traces to clients.

### CMS validation
All CMS content passes through `schema.safeParse()` in mappers.
Parse failure → typed fallback (never throws, never crashes page render).

### Brand validation
`scripts/check-brand.ts` — 10 directories, 5 display brand categories.
Infrastructure identifiers in `config/technical.ts` are not flagged.

---

## 10. Public Page Architecture

### Render strategy
| Route | Strategy | Revalidation |
|---|---|---|
| `/` | ISR | `REVALIDATE.homepage` (3600s) |
| `/services`, `/services/[slug]` | ISR + SSG params | `REVALIDATE.services` (3600s) |
| `/doctors`, `/doctors/[slug]` | ISR + SSG params | `REVALIDATE.doctors` (3600s) |
| `/gallery` | ISR | `REVALIDATE.gallery` (1800s) |
| `/blog`, `/blog/[slug]` | ISR + SSG params | `REVALIDATE.blog_*` (600s) |
| `/faq` | ISR | `REVALIDATE.faq` (3600s) |
| `/contact` | ISR | `REVALIDATE.contact` (3600s) |
| `/book` | Dynamic | noIndex |
| `/admin/*` | Dynamic | noIndex, `requireSession()` |
| `/api/*` | Dynamic | no-store |

### Data access rule
Public pages call `getCmsProvider()` — never `connectDB()`, never Mongoose models directly.
Admin API routes call `connectDB()` + models directly (they are the write path).

### Bundle targets
- Shared JS: < 100 kB (current: 87.3 kB ✅)
- Middleware: < 40 kB (current: 32.6 kB ✅)
- Homepage: < 120 kB (current: 112 kB ✅)

---

## 11. Ready-for-Phase-6 Checklist

### Foundation
- [x] TypeScript: 0 errors
- [x] ESLint: 0 warnings or errors
- [x] Production build: 30/30 pages generated
- [x] Brand validator: 0 violations (10 dirs, 5 categories)
- [x] Shared bundle: 87.3 kB (target <100 kB)
- [x] Middleware: 32.6 kB (target <40 kB)
- [x] Homepage: 112 kB (target <120 kB)

### Architecture
- [x] CMS provider pattern enforced — zero direct DB imports in public layer
- [x] Auth service layer isolated — routes are thin handlers
- [x] Branding / infrastructure separated (`config/branding.ts` vs `config/technical.ts`)
- [x] All public content goes through schema validation + typed fallback
- [x] Rate limiting lazy-initialized (no Upstash build warning)
- [x] Token payload schema-validated before use
- [x] Timing-safe credential validation throughout auth paths
- [x] Log sanitization active (scrubs sensitive keys)
- [x] Origin validation on all mutation auth routes
- [x] Upload pipeline: route → policy → magic-byte → Cloudinary → orphan tracking
- [x] `MediaPendingCleanup` state machine defined (cron wired in Phase 7)
- [x] `docs/route-ownership.md` — all 34 routes documented
- [x] `docs/conventions.md` — server/client, imports, naming, API, a11y, animation, cache
- [x] `docs/brand-architecture.md` — complete brand/infra separation documented
- [x] `docs/foundation-freeze.md` — this document

### Phase 6 prerequisites
- [ ] Phase 6 scope approved
- [ ] Admin CMS screens for: services, doctors, gallery, blog, faq, clinic config
- [ ] Appointment submission API (`POST /api/appointments`) — Phase 6 wires booking form
- [ ] Review/testimonials CRUD — currently empty, testimonials section hidden on homepage
- [ ] ISR revalidation triggers — `revalidateTag()` after every admin write
- [ ] Upload delete endpoint (`DELETE /api/uploads/[publicId]`)

### Explicitly deferred (not Phase 6 blockers unless specified)
- Orphan media cleanup cron (Phase 7)
- Notification emails (Phase 7)
- Analytics dashboard (Phase 8)
- Real favicon .ico/.png assets (deployment step)
- `logo-monochrome.svg` (design team deliverable)
