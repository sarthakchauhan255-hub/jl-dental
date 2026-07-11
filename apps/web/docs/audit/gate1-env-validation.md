# Gate 1 — Environment Validation

## Before
13 files used `process.env.*` directly, bypassing the typed `env.ts` validation layer.

## After
All application code (`app/`, `lib/`, `components/`, `features/`, `context/`, `models/`)
imports from `@/env` exclusively.

| File | Migrated |
|---|---|
| `app/api/auth/forgot-password/route.ts` | ✅ |
| `app/layout.tsx` | ✅ |
| `lib/auth/session.ts` | ✅ |
| `lib/logger.ts` | ✅ |
| `lib/api/logging.ts` | ✅ |
| `lib/media/cloudinary-url.ts` | ✅ |
| `lib/media/cloudinary.ts` | ✅ |
| `lib/notifications/whatsapp.ts` | ✅ |
| `lib/seo.ts` | ✅ |
| `lib/db/connection.ts` | ✅ |
| `lib/security/rate-limit.ts` | ✅ |
| `lib/security/origin.ts` | ✅ |

## Documented Exception

`scripts/seed-admin.ts` and `scripts/verify-indexes.ts` use `process.env` directly.

**Reason**: These are standalone CLI scripts executed via `npx tsx`, outside the Next.js
module graph. `env.ts` uses `@t3-oss/env-nextjs`, which requires Next.js's build/runtime
context to resolve `NEXT_PUBLIC_*` client variables correctly. Importing it from a bare
`tsx` script causes resolution failures.

This is the sole sanctioned exception, isolated to non-application, non-request-path code.

## Removed Hardcoded Fallback

Previously: `process.env.NEXT_PUBLIC_APP_URL ?? "https://jldental.com"` scattered in
`layout.tsx`, `seo.ts`. The fallback masked missing configuration in non-production builds.

Now: `env.NEXT_PUBLIC_APP_URL` — required field, Zod `.url()` validated, build fails loudly
if missing. No silent fallback domain.

## Build Verification
TypeScript: PASS
