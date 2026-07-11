# Adding a New CMS Resource

_Reference: Phase 6.1R — CMS Engine Architecture_

A "resource" is any content type managed through the admin CMS: Doctors, Services, Blog posts, Gallery items, FAQs, etc. This guide walks through all 20 steps to add a new resource without touching engine code.

---

## Conceptual Example: "Testimonials" Resource

This guide uses a hypothetical Testimonials resource as a concrete example. Do not implement it from this document alone — it is for illustration.

---

## Step 1 — Define Identity and Metadata

Choose a resource ID (unique, lowercase, no spaces) and human labels:

```
id:          "testimonial"
label:       "Testimonial"
labelPlural: "Testimonials"
apiPath:     "/api/testimonials"
adminPath:   "/admin/testimonials"
cacheTag:    "testimonials"
```

---

## Step 2 — Define the Mongoose Model

`models/Testimonial.ts`

```ts
import { Schema, model, models } from "mongoose";

const TestimonialSchema = new Schema({
  clinicId:    { type: Schema.Types.ObjectId, ref: "Clinic", default: null },
  patientName: { type: String, required: true, maxlength: 100 },
  comment:     { type: String, required: true, maxlength: 1000 },
  rating:      { type: Number, required: true, min: 1, max: 5 },
  status:      { type: String, enum: ["pending","approved","rejected"], default: "pending" },
  isFeatured:  { type: Boolean, default: false },
  order:       { type: Number, default: 0 },
}, { timestamps: true });

export const Testimonial = models.Testimonial ?? model("Testimonial", TestimonialSchema);
```

---

## Step 3 — Define Zod Validation Schemas

`lib/validations/index.ts` — add:

```ts
export const testimonialCreateSchema = z.object({
  patientName: z.string().min(1).max(100),
  comment:     z.string().min(10).max(1000),
  rating:      z.number().int().min(1).max(5),
  isFeatured:  z.boolean().default(false),
  order:       z.number().int().default(0),
});

export const testimonialUpdateSchema = testimonialCreateSchema.partial();
export const testimonialModerateSchema = z.object({
  status: z.enum(["pending","approved","rejected"]),
});
```

---

## Step 4 — Define the Resource Service

`features/testimonials/testimonials.service.ts`

```ts
import { ApiResourceService } from "@/lib/cms/contracts";
import type { CmsMutationResult } from "@/lib/cms/types";

export interface TestimonialRecord {
  id:          string;
  patientName: string;
  comment:     string;
  rating:      number;
  status:      "pending" | "approved" | "rejected";
  isFeatured:  boolean;
  order:       number;
  createdAt?:  string;
}

export type TestimonialInput = {
  patientName: string;
  comment:     string;
  rating:      number;
  isFeatured?: boolean;
  order?:      number;
};

export class TestimonialService extends ApiResourceService<TestimonialRecord, TestimonialInput> {
  constructor() { super("/api/testimonials"); }

  // Override lifecycle methods with resource-specific semantics
  protected override archivePatch() { return { status: "rejected" as const }; }
  protected override publishPatch()  { return { status: "approved" as const }; }

  async moderate(id: string, status: "approved" | "rejected"): Promise<CmsMutationResult<void>> {
    return this.update(id, { status } as unknown as TestimonialInput);
  }
}

export const testimonialService = new TestimonialService();
```

---

## Step 5 — Define Status Configuration

```ts
import type { CmsStatusConfig } from "@/lib/cms/types";

type TestimonialStatus = "pending" | "approved" | "rejected";

export const testimonialStatusConfig: CmsStatusConfig<TestimonialStatus> = {
  field:         "status",
  defaultStatus: "pending",
  definitions: [
    { value: "pending",  label: "Pending",  badgeVariant: "warning", allowedTransitions: ["approved","rejected"] },
    { value: "approved", label: "Approved", badgeVariant: "success", allowedTransitions: ["rejected"], isPublic: true },
    { value: "rejected", label: "Rejected", badgeVariant: "error",   allowedTransitions: ["approved"] },
  ],
};
```

---

## Step 6 — Define Permissions

Add to `types/auth.ts` Permission union:
```ts
| "testimonials.read"
| "testimonials.create"
| "testimonials.update"
| "testimonials.delete"
```

Add to `lib/auth/rbac.ts` ROLE_PERMISSIONS:
```ts
admin:           [..., "testimonials.read", "testimonials.update"],
content_manager: [..., "testimonials.read", "testimonials.update"],
superadmin:      ["*"],
```

Add to `lib/auth/permissions.ts`:
```ts
export function canModerateTestimonials(user: AuthUser) {
  return hasPermission(user.role, "testimonials.update");
}
```

---

## Step 7 — Define Resource Configuration

`features/testimonials/testimonials.config.ts`

```ts
import { Star }              from "lucide-react";
import { Badge }             from "@/components/ui/badge";
import { ResourceStatusBadge } from "@/components/cms/engine";
import type { CmsResourceConfig } from "@/lib/cms/types";
import { buildCacheConfig }  from "@/lib/cms/cache";
import { resolveStatusDef }  from "@/lib/cms/types";
import { testimonialStatusConfig } from "./testimonials.status";
import { Trash2, Check, X }  from "lucide-react";
import type { TestimonialRecord } from "./testimonials.service";

export const testimonialConfig: CmsResourceConfig<TestimonialRecord, "pending"|"approved"|"rejected"> = {
  meta: {
    label:       "Testimonial",
    labelPlural: "Testimonials",
    icon:        Star,
  },
  routes: {
    apiPath:   "/api/testimonials",
    adminPath: "/admin/testimonials",
  },
  permissions: {
    read:    "testimonials.read",
    create:  "testimonials.create",
    update:  "testimonials.update",
    delete:  "testimonials.delete",
    publish: "testimonials.update",  // approve = publish
    archive: "testimonials.update",  // reject = archive
  },
  status: testimonialStatusConfig,
  cache:  buildCacheConfig("testimonials", /* appearsOnHomepage: */ true),
  audit: {
    resourceName:   "testimonial",
    excludeFromDiff: [],
  },
  table: {
    displayField: "patientName",
    search: { placeholder: "Search testimonials…", fields: ["patientName", "comment"] },
    columns: [
      { key: "patient", header: "Patient",  sortable: true,
        cell: r => <span className="font-medium">{r.patientName}</span> },
      { key: "rating",  header: "Rating",
        cell: r => <span>{r.rating}/5</span> },
      { key: "comment", header: "Comment",  responsive: true,
        cell: r => <span className="line-clamp-1 text-sm text-charcoal-600">{r.comment}</span> },
      { key: "status",  header: "Status",
        cell: r => <ResourceStatusBadge definition={resolveStatusDef(testimonialStatusConfig, r.status)} /> },
    ],
    filters: [
      { key: "status", label: "Status", type: "status",
        options: [
          { label: "Pending",  value: "pending"  },
          { label: "Approved", value: "approved" },
          { label: "Rejected", value: "rejected" },
        ],
      },
    ],
  },
  actions: [
    {
      id: "approve", label: "Approve", icon: Check, scope: ["row"],
      permission: "testimonials.update",
      auditAction: "publish",
      isAvailable: r => r.status === "pending" || r.status === "rejected",
    },
    {
      id: "reject", label: "Reject", icon: X, scope: ["row"],
      permission: "testimonials.update", destructive: true,
      isAvailable: r => r.status !== "rejected",
      confirm: {
        title:       "Reject testimonial?",
        description: r => `"${r.patientName}'s" review will be hidden from the site.`,
      },
      auditAction: "archive",
    },
    {
      id: "delete", label: "Delete", icon: Trash2, scope: ["row", "bulk"],
      permission: "testimonials.delete", destructive: true,
      confirm: {
        title:       "Delete testimonial?",
        description: r => `"${r.patientName}'s" review will be permanently deleted.`,
      },
      auditAction: "delete",
    },
  ],
};
```

---

## Step 8 — Define Table Configuration

Already included in Step 7's `table` section. Add custom columns, filters, and sort options as needed.

---

## Step 9 — Define Form Fields

```ts
import type { CmsFormConfig } from "@/lib/cms/types";

export const testimonialFormConfig: CmsFormConfig<TestimonialRecord> = {
  fields: [
    { name: "patientName", label: "Patient Name", type: "text",   required: true },
    { name: "rating",      label: "Rating (1-5)", type: "number", required: true, hint: "1 = Poor, 5 = Excellent" },
    { name: "comment",     label: "Comment",      type: "textarea", required: true },
    { name: "isFeatured",  label: "Featured",     type: "toggle",  hint: "Show prominently on homepage" },
    { name: "order",       label: "Display Order", type: "number" },
  ],
};
```

---

## Steps 10–12 — Actions, Audit, Cache

- **Actions**: Defined in config (Step 7) — engine dispatches automatically.
- **Audit**: API routes call `emitCmsAudit(ctx)` after each mutation.
- **Cache**: `invalidateCmsCache(config.cache, reason)` in API routes.

---

## Step 13 — Register the Resource

`features/testimonials/index.ts`

```ts
import { registerCmsResource } from "@/lib/cms/registry";
import { testimonialConfig }   from "./testimonials.config";

// Register at module load time — validates config and fails fast if invalid
registerCmsResource("testimonial", testimonialConfig);
```

Import this module from `app/(admin)/admin/testimonials/page.tsx` to trigger registration.

---

## Step 14 — Add API Routes

`app/api/testimonials/route.ts` — GET + POST:

```ts
import { requireSession }       from "@/lib/auth/session";
import { requirePermission }    from "@/lib/auth/rbac";
import { ok, paginated }        from "@/lib/api/responses";
import { parseBody }            from "@/lib/api/validators";
import { handleRouteError }     from "@/lib/api/errors";
import { parsePagination }      from "@/lib/api/pagination";
import { connectDB }            from "@/lib/db/connection";
import { Testimonial }          from "@/models/Testimonial";
import { testimonialCreateSchema } from "@/lib/validations";
import { invalidateCmsCache }   from "@/lib/cms/cache";
import { emitCmsAudit }         from "@/lib/cms/audit";
import { testimonialConfig }    from "@/features/testimonials/testimonials.config";
import type { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    const session = await requireSession();
    requirePermission(session.role, "testimonials.read");
    await connectDB();
    const { page, limit, skip } = parsePagination(req.nextUrl.searchParams);
    const status = req.nextUrl.searchParams.get("status");
    const filter = status ? { status } : {};
    const [docs, total] = await Promise.all([
      Testimonial.find(filter).sort({ order: 1, createdAt: -1 }).skip(skip).limit(limit).lean(),
      Testimonial.countDocuments(filter),
    ]);
    return paginated(docs.map(d => ({ ...d, id: String(d._id) })), page, limit, total);
  } catch (e) { return handleRouteError(e); }
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const session = await requireSession();
    requirePermission(session.role, "testimonials.create");
    const body = await parseBody(req, testimonialCreateSchema);
    await connectDB();
    const doc = await Testimonial.create(body);
    invalidateCmsCache(testimonialConfig.cache!, "create");
    await emitCmsAudit({ actor: { id: session.userId, role: session.role }, action: "create", resource: "testimonial", resourceId: String(doc._id) });
    return ok({ id: String(doc._id) });
  } catch (e) { return handleRouteError(e); }
}
```

`app/api/testimonials/[id]/route.ts` — GET + PATCH + DELETE: same pattern with ID validation.

---

## Step 15 — Add Admin CMS Page

`app/(admin)/admin/testimonials/page.tsx`:

```tsx
import { ResourceListPage } from "@/components/cms/engine";
import { testimonialConfig } from "@/features/testimonials/testimonials.config";
import { testimonialService } from "@/features/testimonials/testimonials.service";
import { getAuthUser }        from "@/lib/auth/session";
import { connectDB }          from "@/lib/db/connection";
import { Testimonial }        from "@/models/Testimonial";

export const dynamic = "force-dynamic";

export default async function TestimonialsPage() {
  const user = await getAuthUser();
  await connectDB();
  const docs = await Testimonial.find().sort({ order: 1 }).limit(10).lean();
  const total = await Testimonial.countDocuments();

  return (
    <ResourceListPage
      config={testimonialConfig}
      service={testimonialService}
      initialData={JSON.parse(JSON.stringify(docs)).map((d: Record<string, unknown>) => ({ ...d, id: String(d._id) }))}
      initialTotal={total}
      user={user}
    />
  );
}
```

---

## Steps 16–17 — Authorization + Validation Tests

### Authorization
- `GET /api/testimonials` with no cookie → 401
- `DELETE /api/testimonials/[id]` with `content_manager` role → 403 (no testimonials.delete)
- `PATCH /api/testimonials/[id]` with `admin` role → 200

### Validation
- `POST /api/testimonials` with missing `patientName` → 422 + `{ fields: { patientName: "Required" } }`
- `POST /api/testimonials` with `rating: 6` → 422

### Cache Invalidation
- Update a testimonial → verify `CACHE_TAGS.testimonials` and `CACHE_TAGS.homepage` are revalidated

---

## Step 18 — Run Registry Validation

```bash
npx tsx scripts/validate-cms-registry.ts
```

The registry validator will:
- Check for duplicate resource IDs
- Validate all required config fields
- Validate status transition integrity
- Validate action IDs are unique

---

## Step 19 — Add to Navigation

`lib/constants/app.ts` — ADMIN_NAV_LINKS:
```ts
{ label: "Testimonials", href: "/admin/testimonials", icon: "Star" },
```

---

## Step 20 — Run Verification

```bash
npx tsc --noEmit      # 0 errors
npm run lint          # ✔ No warnings
npm run build         # ✓ All pages generated
npx tsx scripts/check-brand.ts  # ✅ 0 violations
```

---

## Key Rules

| Rule | Location |
|---|---|
| No business logic in engine | `lib/cms/` and `components/cms/engine/` |
| No RHF imports in resource files | Only `components/cms/engine/form/cms-form.tsx` |
| Cache invalidation via `invalidateCmsCache()` | Never call `revalidateTag` directly in resources |
| Audit via `emitCmsAudit()` | Never call `auditAction()` directly in CMS routes |
| Server always enforces auth | `requirePermission()` in every API route |
| Status defined per-resource | Never use global CmsStatus strings |
| Actions registered, not hardcoded | No `if action === "publish"` in engine |
