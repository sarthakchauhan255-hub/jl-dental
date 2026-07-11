# CMS CRUD Engine

_Completed: Phase 6.1_

The CRUD engine is the reusable infrastructure layer that all content modules inherit.
No business-specific logic lives in the engine. Every future module uses this foundation.

---

## Architecture Overview

```
Business Module (e.g. Doctors)
  │
  ├── ResourceConfig       (lib/cms/types.ts — static config object)
  ├── ResourceService      (extends ApiResourceService — API adapter)
  ├── Zod schema           (lib/validations/index.ts)
  │
  └── Next.js pages
        ├── /admin/doctors        → ResourceListPage  (engine)
        ├── /admin/doctors/new    → ResourceCreatePage (engine)
        └── /admin/doctors/[id]   → ResourceEditPage  (engine)
              │
              └── CmsForm (engine)
                    └── CmsField (engine) × n
```

The business module provides **config**, **service**, **schema**, and **field layout**.
The engine provides **all behaviour**: CRUD, permissions, errors, audit, loading states.

---

## Layer Responsibilities

### `lib/cms/types.ts` — Core type system
- `CmsStatus` + `CMS_STATUS_REGISTRY` — all lifecycle states and transition rules
- `CmsResourceConfig<T>` — complete resource specification (labels, api path, permissions, columns, filters)
- `CmsTableColumn<T>` — column definition for the table engine
- `CmsFormField` — field type definitions (text, slug, select, toggle, textarea, tags, media, etc.)
- `CmsAction<T>` — action type with confirmation dialog, permission, and context
- `CmsRecord` — base record shape (id + timestamps + index signature)
- `CmsListQuery` / `CmsListResponse<T>` / `CmsMutationResult<T>` — API shapes

### `lib/cms/contracts.ts` — Service contract
- `CmsResourceService<T>` interface — all CRUD + lifecycle methods any module must implement
- `ApiResourceService<T>` — base class that implements the contract over the standard REST API.
  Business modules extend this; overriding only what differs.

### `lib/cms/validation.ts` — Validation utilities
- `validateWithSchema()` — Zod parse with structured field error extraction
- `generateSlug()` — deterministic slug from display name
- `isValidSlug()` — validation predicate
- `coerceEmpty()` — empty string → undefined for optional fields
- `mergeServerErrors()` — combine server field errors with client state

### `lib/cms/permissions.ts` — Permission engine
- `resolvePermission(config, action)` — maps CmsActionType to Permission string
- `canPerform(user, config, action)` — single truth: can this user do this action?
- `resolveAllPermissions(user, config)` — returns complete action → boolean map

### `lib/cms/audit.ts` — Audit integration
- `emitCmsAudit(entry)` — server-side, wraps `auditAction()` with CMS-specific mapping
- `diffObjects(prev, next)` — returns field-level change map for audit records

### `lib/cms/errors.ts` — Error system
- `CmsErrorType` — typed enum: validation, permission, not_found, conflict, network, server, transition, deleted
- `parseCmsError(response)` — converts API error response to typed `CmsError`
- `getCmsErrorMessage(error, label)` — user-facing message for each error type

---

## CRUD Lifecycle

### Create flow
```
User fills form
  → react-hook-form validates on submit (Zod via zodResolver)
  → field errors shown inline on failure
  → on success: ResourceCreatePage.handleSubmit()
    → service.create(data)           [ApiResourceService → POST /api/{resource}]
    → on API error: parseCmsError() → setServerError → injected into RHF via setError()
    → on success: router.push(adminPath/[id])
```

### Edit flow
```
Server fetches record → passed as defaultValues to ResourceEditPage
  → User edits (RHF tracks dirty state)
  → UnsavedWarning active when isDirty
  → Submit → service.update(id, data)  [PATCH /api/{resource}/[id]]
  → SaveIndicator: idle → saving → saved → idle
  → Server errors injected back into RHF field state
```

### Delete flow
```
User clicks delete in row actions
  → ConfirmDialog opens (destructive)
  → Confirm → service.delete(id)      [DELETE /api/{resource}/[id]]
  → router.refresh() to reload table
```

### Bulk delete flow
```
User selects rows via checkbox
  → "Delete selected" bulk action appears
  → ConfirmDialog with count
  → Promise.all(records.map(r => service.delete(r.id)))
  → router.refresh()
```

### Publish/unpublish (toggle)
```
Row action click → service.publish(id) or service.unpublish(id)
  → PATCH { isActive: true/false }
  → router.refresh()
```

### Archive flow
```
Row archive button → ConfirmDialog
  → service.archive(id)   → PATCH { status: "archived" }
  → router.refresh()
```

---

## Extension Points

Business modules extend the engine through composition — not inheritance.

### 1. Custom field layout
`ResourceCreatePage` and `ResourceEditPage` accept a `children` render prop:
```tsx
<ResourceCreatePage config={doctorConfig} service={doctorService} schema={doctorSchema}>
  {(form) => (
    <>
      <SectionCard title="Basic Info">
        <CmsField config={{ name: "name", label: "Full Name", type: "text", required: true }} form={form} />
        <CmsField config={{ name: "slug", label: "URL Slug", type: "slug", slugSource: "name" }} form={form} />
      </SectionCard>
      {/* Any custom UI — media upload, rich text, etc. */}
    </>
  )}
</ResourceCreatePage>
```

### 2. Custom row actions
`CmsTable` accepts `rowActions` prop:
```tsx
<CmsTable ... rowActions={(record) => (
  <Button onClick={() => previewDoctor(record)}>Preview</Button>
)} />
```

### 3. Custom toolbar (filters)
`CmsTable` and `ResourceListPage` accept `toolbarSlot`:
```tsx
<ResourceListPage ... toolbarSlot={
  <ResourceFilterBar
    filters={[{ key: "specialization", label: "Specialization", type: "select", options: SPECIALIZATIONS }]}
    onSearch={setQ}
    onFilter={(key, val) => setFilters(f => ({ ...f, [key]: val }))}
  />
} />
```

### 4. Custom header actions
```tsx
<ResourceListPage ... headerActions={
  <Button asChild variant="secondary" size="sm">
    <Link href="/admin/doctors/import">Import CSV</Link>
  </Button>
} />
```

### 5. Extending the service
```tsx
class DoctorService extends ApiResourceService<DoctorRecord, DoctorInput> {
  constructor() { super("/api/doctors"); }

  // Override publish to use isActive toggle
  async publish(id: string) {
    return this.update(id, { isActive: true });
  }

  // Add resource-specific method
  async getBySpecialization(spec: string) {
    return this.findMany({ specialization: spec });
  }
}
```

### 6. Status system — custom transitions
Modules that use `status` field (like Blog) override the transition validation in their API route.
The engine's `CMS_STATUS_REGISTRY` defines allowed transitions — the API enforces them:
```ts
if (!isValidTransition(current.status, body.status)) {
  return err("Invalid status transition", 422);
}
```

---

## Status Lifecycle

```
CmsStatus values and allowed transitions:

draft      → published, archived
published  → draft, archived
hidden     → published, archived
archived   → draft
deleted    → (terminal)
pending    → approved, rejected
approved   → rejected
rejected   → approved
```

Status badge colors:
- green:  approved, published
- yellow: pending, draft
- orange: archived, hidden
- red:    rejected, deleted

Simple boolean resources (isActive toggle) use `ResourceStatusBadge active={isActive}` — no status field.

---

## Permission Flow

```
User action (click publish, delete, create)
  │
  ├── Client layer (UI gating only — cannot be trusted):
  │     canPerform(user, config, action) → show/hide button
  │
  └── Server layer (enforced):
        requireSession()
        requirePermission(session.role, config.permissions[action])
        → 403 on failure
        → never reaches DB
```

No inline `if (role === "admin")` checks anywhere in the engine or business modules.
All routing goes through `canPerform()` client-side and `requirePermission()` server-side.

---

## Validation Flow

```
Client:
  CmsForm → zodResolver(schema) → useForm → RHF validates on blur + submit
  Field errors: form.formState.errors[field].message
  Form errors: onSubmit returns CmsError → shown in error banner

Server:
  parseBody(req, schema) → throws ValidationError → handleRouteError() → 422 + { fields }
  Client receives fields → setError() injects into RHF field state
```

Two schema layers for one resource:
- `create` schema — all required fields
- `update` schema — all optional (`.partial()` of create schema)

---

## Audit Flow

Every API route mutation calls `emitCmsAudit()` after a successful DB write:

```ts
await emitCmsAudit({
  userId:     session.userId,
  action:     "update",
  resource:   "doctor",
  resourceId: id,
  changes:    diffObjects(before, after),  // optional — shows what changed
});
```

`emitCmsAudit()` is fire-and-forget — it never blocks the API response.
`diffObjects()` produces a `{ field: { from, to } }` map for the audit log.

---

## Future Resource Onboarding Guide

To add a new CMS resource (e.g. "Procedures"):

1. **Mongoose model**: `models/Procedure.ts`

2. **Validation schemas**: `lib/validations/index.ts`
   ```ts
   export const procedureCreateSchema = z.object({ ... });
   export const procedureUpdateSchema = procedureCreateSchema.partial();
   ```

3. **API routes**: `app/api/procedures/route.ts` + `[id]/route.ts`
   - Use `requireSession()` + `requirePermission()`
   - Call `emitCmsAudit()` after every write
   - Call `revalidateTag(CACHE_TAGS.procedures)` after writes

4. **Resource config**: `features/procedures/config.ts`
   ```ts
   export const procedureConfig: CmsResourceConfig<ProcedureRecord> = {
     label: "Procedure", labelPlural: "Procedures",
     icon: Scissors,
     apiPath: "/api/procedures",
     adminPath: "/admin/procedures",
     displayField: "name",
     permissions: { read: "services.read", create: "services.create", ... },
     columns: [ ... ],
   };
   ```

5. **Service**: `features/procedures/service.ts`
   ```ts
   export class ProcedureService extends ApiResourceService<ProcedureRecord, ProcedureInput> {
     constructor() { super("/api/procedures"); }
   }
   export const procedureService = new ProcedureService();
   ```

6. **Admin pages**: `app/(admin)/admin/procedures/`
   - `page.tsx` — wraps `ResourceListPage`
   - `new/page.tsx` — wraps `ResourceCreatePage`
   - `[id]/page.tsx` — wraps `ResourceEditPage`

7. **Navigation**: Add to `ADMIN_NAV_LINKS` in `lib/constants/app.ts`

8. **Permissions**: Add to `types/auth.ts` + `lib/auth/rbac.ts` + `lib/auth/permissions.ts`

9. **Cache**: Add tag to `lib/cache.ts`

**Estimated effort per resource: ~2–3 hours** (vs. ~1–2 days without the engine).

---

## Developer Conventions

- Import engine components from `@/components/cms/engine` — never from sub-paths
- Import engine types from `@/lib/cms` — never from sub-paths
- `CmsResourceConfig` is defined once per resource — co-located with the feature
- `ApiResourceService` extension is the only service class needed per resource
- Never add business logic to engine components
- Never add engine imports to `lib/cms/` (that lib layer has no UI dependencies)
- All form UI goes in the `children` render prop — never modify `CmsForm` for a resource
