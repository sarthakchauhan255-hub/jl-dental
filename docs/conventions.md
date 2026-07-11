# JL Dental — Architecture Conventions

Single source of truth for engineering decisions.
All contributors follow these. Deviations require explicit approval.

---

## 0. Default: Server Components

Every component is a Server Component unless proven otherwise.

`"use client"` is required only for:
- `useState`, `useReducer`, `useEffect`, `useRef`
- Browser APIs (`window`, `document`)
- Event handlers on interactive elements
- Libraries that require browser context

Push `"use client"` to the smallest possible leaf. Never add it to layout wrappers,
static sections, or components that only receive and display props.

---

## 1. Server / Client Boundaries

### Rule: Default to Server Components
Every component is a Server Component unless it explicitly needs client features.

**Add `"use client"` only when the component uses:**
- `useState`, `useReducer`, `useEffect`, `useRef`
- Browser APIs (`window`, `document`, `localStorage`)
- Event handlers directly on interactive elements
- Third-party libraries that require browser context (Framer Motion, etc.)

**Never add `"use client"` to:**
- Layout wrappers (unless they hold client state)
- Static content sections
- Components that only receive and display props
- SEO/metadata components

### Hydration boundary pattern
Push `"use client"` as deep as possible — wrap only the interactive leaf, not the parent.

```
// ❌ Wrong — entire section becomes client
"use client"
export function ServicesSection({ services }) { ... }

// ✅ Right — only the interactive part is client
export function ServicesSection({ services }) {  // Server Component
  return <div>{services.map(s => <ServiceCard key={s.id} service={s} />)}</div>
}
"use client"
export function ServiceCard({ service }) {  // Only this needs hover/animation
  const [hovered, setHovered] = useState(false); ...
}
```


### Framer Motion isolation

Motion components must be isolated to interactive UI islands — never wrap pages,
layouts, or large sections. This keeps the client bundle small and avoids
accidental hydration of entire route trees.

```tsx
// ✅ Correct — motion wraps only the animated leaf
export function DoctorCard({ doctor }: { doctor: Doctor }) {
  return (
    <HoverCard className="card-base">       {/* client island */}
      <DoctorCardContent doctor={doctor} />  {/* server-renderable content inside */}
    </HoverCard>
  );
}

// ❌ Wrong — entire layout becomes a client component
"use client";
export default function DoctorsPage() {
  return <motion.main>...</motion.main>;
}
```

Acceptable motion wrappers: `Reveal`, `StaggerReveal`, `HoverCard` from
`@/components/common/motion`. Import these — do not use `motion.*` directly
in page or section components.

---

## 2. Import Rules

### Canonical import paths (always use `@/` aliases)
```typescript
// ✅ Correct
import { Button }       from "@/components/ui/button";
import { connectDB }    from "@/lib/db/connection";
import { sendEmail }    from "@/lib/notifications/email";
import { AppError }     from "@/lib/security/errors";
import { ROUTES }       from "@/constants/routes";
import type { IDoctor } from "@/models/Doctor";

// ❌ Never
import { Button } from "../../components/ui/button";
import { connectDB } from "../lib/db";
```

### Import order (enforced by ESLint in Phase 9)
1. Node built-ins (`crypto`, `path`)
2. External packages (`react`, `next`, `mongoose`)
3. Internal `@/` aliases — types first, then values
4. Relative imports (only within same feature folder)

### Domain barrel imports
```typescript
// ✅ Import from domain barrel
import { hasPermission } from "@/lib/auth";
import { buildCloudinaryUrl } from "@/lib/media";

// ✅ Import from specific file when only one export needed
import { connectDB } from "@/lib/db/connection";
```

---

## 3. Naming Rules

### Files
- Components: `PascalCase.tsx` — `DoctorCard.tsx`, `HeroSection.tsx`
- Utilities: `kebab-case.ts` — `rate-limit.ts`, `cloudinary-url.ts`
- API routes: `route.ts` (Next.js convention)
- Server utilities: `get-doctors.ts`, `create-appointment.ts` (verb-noun)
- Types: `index.ts` in `/types/` or co-located `types.ts`
- Constants: `SCREAMING_SNAKE_CASE` for values, `PascalCase` for objects

### Variables and functions
```typescript
// Components — PascalCase
export function DoctorCard() {}

// Hooks — camelCase with use prefix
export function useClinicConfig() {}

// Server utilities — camelCase, descriptive verbs
export async function getActiveDoctors() {}
export async function createAppointment() {}

// Constants — SCREAMING_SNAKE_CASE
export const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024;
export const CACHE_TAGS = { ... };  // PascalCase object, SCREAMING values inside
```

### API routes
- Resource collection: `GET /api/doctors`
- Single resource: `GET /api/doctors/[id]`
- Sub-resource: `PATCH /api/appointments/[id]/status`
- Action (where REST doesn't fit): `POST /api/auth/logout`

---

## 4. API Response Conventions

All API routes return this envelope:

```typescript
// Success
{ success: true, data: T }
{ success: true, data: T[], pagination: { page, limit, total, totalPages } }

// Error
{ success: false, error: string, code?: string }
{ success: false, error: string, fields?: Record<string, string> }  // validation
```

### HTTP status codes
| Situation | Code |
|---|---|
| Success (data returned) | 200 |
| Created | 201 |
| No content | 204 |
| Validation error | 422 |
| Auth required | 401 |
| Permission denied | 403 |
| Not found | 404 |
| Conflict (duplicate) | 409 |
| Rate limited | 429 |
| Server error | 500 |

### Error messages to client
- Always generic on auth failures: "Invalid email or password" — never "Email not found"
- Never expose: stack traces, DB error messages, internal IDs in error text
- Validation errors: field-level messages via `fields` object

### Route handler pattern
```typescript
import { routeHandler }  from "@/lib/async";
import { requireAuth }   from "@/lib/api-helpers";
import { successResponse } from "@/lib/api-helpers";

export const GET = routeHandler(async (req) => {
  const session = await requireAuth("doctors.read");
  // ... logic
  return successResponse(data);
});
```

---

## 5. Accessibility Rules (non-negotiable baseline)

### Images
```tsx
// ✅ Always meaningful alt text
<Image src={doctor.photo.url} alt={`Dr. ${doctor.name}, ${doctor.specialization}`} />

// ✅ Decorative images explicitly marked
<Image src={divider.url} alt="" role="presentation" />
```

### Interactive elements
- Minimum tap target: 44×44px on mobile
- All buttons/links keyboard-navigable (no `tabIndex={-1}` without good reason)
- No `onClick` on non-interactive elements — use `<button>` or `<a>`
- Hover-dependent UX: always has keyboard/focus equivalent

### Focus states
```tsx
// ✅ Never remove focus outline — replace with custom style
className="focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-400"

// ❌ Never
className="outline-none"  // removes all focus visibility
```

### Forms
```tsx
// ✅ Every input has a visible label
<Label htmlFor="email">Email address</Label>
<Input id="email" aria-describedby="email-error" />
{error && <p id="email-error" role="alert">{error}</p>}
```

### Modals and drawers
- Focus trapped inside when open
- Escape key closes
- Returns focus to trigger element on close
- `aria-modal="true"` on the container

### Semantic HTML
- One `<h1>` per page
- Heading hierarchy not skipped (h1 → h2 → h3)
- `<nav>` for navigation, `<main>` for main content, `<footer>` for footer
- `<button>` for actions, `<a>` for navigation

---

## 6. Animation Discipline

### Rules
1. Every animation must justify its existence — what does it communicate?
2. `transform` and `opacity` only — never animate `height`, `width`, `top`, `left` (causes layout thrash)
3. All durations from `lib/motion.ts` — no inline values
4. All easings from `lib/motion.ts` — no inline cubic-bezier
5. Respect `prefers-reduced-motion` — use `useReducedMotion()` hook

### What animations are for
```
Reveal (fade-up):     Communicates content appearing naturally
State transition:     Communicates a change happened
Hover lift:           Communicates interactivity
Loading shimmer:      Communicates content is coming
Error shake:          Communicates invalid input (use sparingly)
```

### What animations are NOT for
- Making the page feel "alive" for its own sake
- Compensating for slow data loading
- Showing technical sophistication
- Entertainment

### Luxury aesthetic principle
> A premium dental clinic is calm, confident, and unhurried.
> Motion should feel like the UI is breathing, not performing.

```tsx
// ✅ Correct — subtle, purposeful
<Reveal variant="fadeUp" delay={0.1}>
  <DoctorCard doctor={doctor} />
</Reveal>

// ❌ Wrong — aggressive, distracting
<motion.div animate={{ scale: [1, 1.05, 1] }} transition={{ repeat: Infinity }}>
```

### Reduced motion
```tsx
// Always in animated components
const reducedMotion = useReducedMotion();
return (
  <motion.div
    initial={reducedMotion ? false : { opacity: 0, y: 24 }}
    animate={{ opacity: 1, y: 0 }}
  />
);
```

---

## 7. Trust Boundaries (unknown + validation)

Any data crossing a trust boundary must be validated before use.

**Trust boundaries:**
- HTTP request body → Zod parse before any use
- URL search params → parse and validate type before use
- Database query results → typed via Mongoose schema (lean() returns typed objects)
- External API responses (Cloudinary, Resend) → typed result objects with error paths
- `localStorage` / cookies → never for auth tokens; validate before use

```typescript
// ✅ Correct — validate at boundary
const body = await req.json() as unknown;
const data = appointmentSchema.parse(body);  // throws on invalid

// ❌ Wrong — trust without validation
const data = await req.json() as AppointmentInput;

// ✅ Correct — type external API response safely
const result: unknown = await externalApi.call();
if (!isExpectedShape(result)) throw new ExternalServiceError("API");
```

**The `any` rule:**
`any` is forbidden. Use `unknown` at boundaries, then narrow via:
- Type guards (`instanceof`, `typeof`, `in`)
- Zod schemas
- Explicit assertions with justification comment

---

## 8. Caching Philosophy

See `lib/cache.ts` for constants.

**Rules:**
1. Public pages use ISR with `REVALIDATE.*` constants — never hard-code seconds
2. Admin routes always `cache: "no-store"` — never serve stale admin data
3. Tag writes: every mutation calls `revalidateTag(CACHE_TAGS.*)` for affected data
4. Tag all fetches: `next: { tags: [CACHE_TAGS.services], revalidate: REVALIDATE.services }`
5. Never `revalidatePath("/")` globally — too broad; use specific tags
6. Clinic config changes: `revalidateTag(CACHE_TAGS.clinic)` + `revalidateTag(CACHE_TAGS.homepage)`

**Revalidation trigger pattern (in API route handlers after write):**
```typescript
import { revalidateTag } from "next/cache";
import { CACHE_TAGS } from "@/lib/cache";

// After updating a service:
revalidateTag(CACHE_TAGS.services);
revalidateTag(CACHE_TAGS.homepage);  // services appear on homepage too
```
