# Brand Architecture

_Updated: Phase 5.2_

---

## Philosophy

The platform enforces a strict separation between what users **see** (branding)
and what the system **uses** (infrastructure). These concerns live in different
files and change for different reasons.

```
config/branding.ts    → display identity (names, copy, colors, logos)
config/technical.ts   → system identifiers (slugs, prefixes, service IDs)
```

A rebrand never touches infrastructure. An infrastructure change never touches copy.

---

## Brand Flow

```
config/branding.ts
  ├── BRAND constants           → all display strings
  ├── BRAND_COLORS              → design token references (Tailwind aliases)
  └── getBrandAssets()          → logo paths, favicon paths, monogram

Consumers:
  app/layout.tsx                → metadata, OG, twitter, theme colors, favicon icon
  components/common/brand-logo.tsx  → all logo renders (navbar, footer, admin)
  lib/seo.ts                    → SITE_NAME, TITLE_SUFFIX, BLOG_SUFFIX
  features/*/schemas/            → Zod default values (BRAND.NAME, BRAND.AUTHOR)
  features/*/fallback-data/      → CMS fallback content defaults
  features/shared/cms/fallback/  → CmsProvider fallback data
  app/(admin)/admin/*/page.tsx   → admin UI display strings
```

## Infrastructure Flow

```
config/technical.ts
  └── TECH constants            → APP_SLUG, CLOUDINARY_PREFIX, SERVICE_NAME, etc.

Consumers:
  lib/logger.ts                 → TECH.SERVICE_NAME (log output identifier)
  lib/media/cloudinary.ts       → TECH.CLOUDINARY_PREFIX (folder root)
  lib/db/connection.ts          → TECH.APP_SLUG (dev DB name)
  lib/constants/app.ts          → TECH.CLOUDINARY_PREFIX (folder map)
  features/clinic/server/get-clinic.ts  → TECH.DEFAULT_CLINIC_SLUG (DB query)
  app/api/uploads/route.ts      → TECH.DEFAULT_UPLOAD_TAG (Cloudinary tags)
```

## Logo Flow

```
/public/branding/
  logo.svg              → default wordmark (dark text, light background)
  logo-light.svg        → light wordmark (white text, dark/color background)
  logo-dark.svg         → dark wordmark (high contrast on off-white)
  logo-mono.svg         → monochrome mark (print, emboss) [add when ready]
  favicon/
    icon.svg            → icon-only mark (32×32, no wordmark)
    favicon.ico         → [generate from icon.svg at deployment]
    icon-192.png        → [generate at deployment — PWA]
    icon-512.png        → [generate at deployment — PWA]
    apple-touch-icon.png → [generate at deployment — 180×180]
```

### Variant selection rules

| Context | Variant |
|---|---|
| Navbar on white/light page | `default` |
| Navbar on dark hero (homepage) | `light` |
| Footer (dark bg) | `light` |
| Admin sidebar (dark bg) | `icon` via monogram |
| Email header | `default` |
| Favicon | `icon` |
| OG image | `default` |
| Print | `monochrome` (when available) |

### Usage rule

No component imports a logo asset directly. All logo renders go through `BrandLogo`:

```tsx
// ✅ All logo renders
import { BrandLogo } from "@/components/common/brand-logo";
<BrandLogo variant="light" href="/" />
<BrandLogo iconOnly />                  // icon mark only

// ✅ When raw asset path needed (e.g., OG metadata)
import { getBrandAssets } from "@/config/branding";
const brand = getBrandAssets();
// → brand.logo.default, brand.favicon.svg, etc.

// ❌ Forbidden
import logo from "/public/branding/logo.svg";
```

## Theme / Color Flow

`BRAND_COLORS` in `config/branding.ts` maps semantic roles to Tailwind token names:

```ts
BRAND_COLORS.primary    → "primary"       → tailwind: primary-{shade}
BRAND_COLORS.secondary  → "charcoal"      → tailwind: charcoal-{shade}
BRAND_COLORS.background → "background"    → CSS var: --background
BRAND_COLORS.surface    → "white"
BRAND_COLORS.text       → "foreground"    → CSS var: --foreground
BRAND_COLORS.muted      → "muted"
BRAND_COLORS.accent     → "accent-gold"
BRAND_COLORS.success    → "green"
BRAND_COLORS.warning    → "amber"
BRAND_COLORS.error      → "destructive"   → CSS var: --destructive
BRAND_COLORS.border     → "border"        → CSS var: --border
```

A design refresh updates `tailwind.config.ts` (and CSS vars) only.
Component class names reference tokens — they never need to change for a retheme.

## Validator Flow

```bash
npx tsx scripts/check-brand.ts
```

Scans: `app/`, `features/`, `lib/`, `components/`, `constants/`, `context/`,
`config/`, `providers/`, `hooks/`

Detects display literals that should come from `config/branding.ts`:
- Clinic name: "JL Dental Clinic"
- Admin label: "JL Dental Admin"
- WhatsApp message: "like to book an appointment at"
- Support email: "admin@jldental.com"
- OG/SEO title: "Premium Dental Care in Solan"

Infrastructure identifiers (`jl-dental` slug, Cloudinary prefixes) are correctly in
`config/technical.ts` and are not flagged.

**Escape hatch**: append `// brand-ok` to suppress a specific line.
Reserved for `export const metadata` in Next.js admin pages (template literals
forbidden in static metadata exports).

**Add to CI pipeline:**
```yaml
- name: Brand lock check
  run: npx tsx apps/web/scripts/check-brand.ts
```

## Future Rebranding Process

Complete clinic rebrand (e.g., "JL Dental" → "ClearSmile Dental"):

1. Edit `config/branding.ts`:
   - Update all `BRAND.*` string values
   - Update `getBrandAssets()` to point to new logo file paths
2. Edit `config/technical.ts`:
   - Update `APP_SLUG`, `CLOUDINARY_PREFIX`, `SERVICE_NAME` if infra names should change
   - (Infrastructure change is separate from brand change)
3. Replace logo files in `/public/branding/`
4. Regenerate favicon assets from new icon.svg
5. Run `npx tsx scripts/check-brand.ts` → must pass before deployment
6. Update `NEXT_PUBLIC_APP_URL` in environment if domain changes
7. Run full build → deploy

**Zero component changes required.** All display strings flow through `BRAND`.
All logo renders flow through `BrandLogo` / `getBrandAssets()`.

## Multi-Clinic Branding Strategy

When the platform expands to multiple clinics:

### Phase A — Per-clinic overrides (Phase 6+)
- `getBrandAssets(clinicId?)` resolves from DB clinic config, falling back to `BRAND` defaults
- Clinic documents in MongoDB store: `{ name, logo: { default, light, dark }, colors? }`
- `CmsProvider.getClinicConfig()` already returns `ClinicPublicContent.logo` — logos are ready

### Phase B — Full white-label
- `config/branding.ts` becomes the **platform** brand (e.g., "Powered by DentalOS")
- Per-clinic branding managed entirely in DB and served dynamically
- `TECH.*` remains unchanged — it's platform infrastructure, not clinic-specific

### Separation enforced now
The `BRAND` / `TECH` split already isolates platform identity from infrastructure.
Adding a third layer (per-clinic) requires only a new resolution layer in
`getCmsProvider()` — no architectural changes to components, validators, or SEO helpers.
