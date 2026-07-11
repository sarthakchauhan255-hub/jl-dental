# CMS Permissions

_Status: Pending approval. Drives RBAC implementation across all CMS modules._

---

## Role Definitions

| Role | Description |
|---|---|
| `superadmin` | Full access to everything. Can manage users, roles, and system config. |
| `admin` | Full CMS access. Can manage all content, moderate reviews, view analytics. Cannot manage other users (superadmin only). |
| `content_manager` | Can create and edit content (blog, gallery, FAQ, services description). Cannot delete. Cannot access clinic settings. |
| `receptionist` | Read-only access to appointments and public content. No write access. |
| `doctor` | Can read their own appointment schedule. Can update their own doctor profile only. |

---

## Permission Matrix

### Clinic Settings

| Permission | superadmin | admin | content_manager | receptionist | doctor |
|---|---|---|---|---|---|
| `clinic.read` | ✅ | ✅ | ✅ (read-only) | ❌ | ❌ |
| `clinic.update` | ✅ | ✅ | ❌ | ❌ | ❌ |

**Notes:**
- `content_manager` can read clinic config (needed for context) but cannot modify it
- Homepage section editing requires `clinic.update`

---

### Doctors

| Permission | superadmin | admin | content_manager | receptionist | doctor |
|---|---|---|---|---|---|
| `doctors.read` | ✅ | ✅ | ✅ | ✅ | ✅ |
| `doctors.create` | ✅ | ✅ | ❌ | ❌ | ❌ |
| `doctors.update` | ✅ | ✅ | ❌ | ❌ | ✅ (own only) |
| `doctors.delete` | ✅ | ✅ | ❌ | ❌ | ❌ |

**Notes:**
- `doctors.update.own` — doctor may only edit their own profile (linked via `userId`)
- Profile activation/deactivation (`isActive`) requires `doctors.update` (not `.own`)

---

### Services

| Permission | superadmin | admin | content_manager | receptionist | doctor |
|---|---|---|---|---|---|
| `services.read` | ✅ | ✅ | ✅ | ✅ | ✅ |
| `services.create` | ✅ | ✅ | ❌ | ❌ | ❌ |
| `services.update` | ✅ | ✅ | ✅ | ❌ | ❌ |
| `services.delete` | ✅ | ✅ | ❌ | ❌ | ❌ |

**Notes:**
- `content_manager` can update descriptions but cannot create new services or delete

---

### Blog

| Permission | superadmin | admin | content_manager | receptionist | doctor |
|---|---|---|---|---|---|
| `blog.read` | ✅ | ✅ | ✅ | ❌ | ❌ |
| `blog.create` | ✅ | ✅ | ✅ | ❌ | ❌ |
| `blog.update` | ✅ | ✅ | ✅ | ❌ | ❌ |
| `blog.delete` | ✅ | ✅ | ✅ | ❌ | ❌ |

**Notes:**
- `content_manager` has full blog CRUD — this is their primary domain
- Phase 7+: add `blog.publish` permission separate from `blog.update` for approval workflows

---

### Gallery

| Permission | superadmin | admin | content_manager | receptionist | doctor |
|---|---|---|---|---|---|
| `gallery.read` | ✅ | ✅ | ✅ | ❌ | ❌ |
| `gallery.create` | ✅ | ✅ | ✅ | ❌ | ❌ |
| `gallery.update` | ✅ | ✅ | ✅ | ❌ | ❌ |
| `gallery.delete` | ✅ | ✅ | ✅ | ❌ | ❌ |

---

### FAQ

| Permission | superadmin | admin | content_manager | receptionist | doctor |
|---|---|---|---|---|---|
| `faq.read` | ✅ | ✅ | ✅ | ❌ | ❌ |
| `faq.create` | ✅ | ✅ | ✅ | ❌ | ❌ |
| `faq.update` | ✅ | ✅ | ✅ | ❌ | ❌ |
| `faq.delete` | ✅ | ✅ | ✅ | ❌ | ❌ |

---

### Reviews / Testimonials

| Permission | superadmin | admin | content_manager | receptionist | doctor |
|---|---|---|---|---|---|
| `reviews.read` | ✅ | ✅ | ✅ | ✅ | ❌ |
| `reviews.update` | ✅ | ✅ | ✅ | ❌ | ❌ |
| `reviews.delete` | ✅ | ❌ | ❌ | ❌ | ❌ |

**Notes:**
- `reviews.delete` is `superadmin` only — reviews are permanent audit records
- `reviews.update` covers: approve, reject, feature, order

---

### Media

| Permission | superadmin | admin | content_manager | receptionist | doctor |
|---|---|---|---|---|---|
| `media.upload` | ✅ | ✅ | ✅ | ❌ | ❌ |
| `media.delete` | ✅ | ✅ | ✅ | ❌ | ❌ |

---

### Analytics

| Permission | superadmin | admin | content_manager | receptionist | doctor |
|---|---|---|---|---|---|
| `analytics.read` | ✅ | ✅ | ❌ | ✅ | ❌ |

---

### Appointments

| Permission | superadmin | admin | content_manager | receptionist | doctor |
|---|---|---|---|---|---|
| `appointments.read` | ✅ | ✅ | ❌ | ✅ | ✅ (own) |
| `appointments.create` | ✅ | ✅ | ❌ | ❌ | ❌ |
| `appointments.update` | ✅ | ✅ | ❌ | ✅ | ❌ |
| `appointments.delete` | ✅ | ✅ | ❌ | ❌ | ❌ |

---

## Implementation Rules

### In API routes
```typescript
// Correct — always use permission helpers
import { canManageDoctors } from "@/lib/auth/permissions";
if (!canManageDoctors(session)) throw new AuthorizationError();

// Wrong — never inline role checks
if (session.role !== "admin") throw new Error("Forbidden");
```

### In admin UI (client)
```typescript
// Correct — use hooks for show/hide decisions only
const canEdit = usePermission("doctors.update");
if (!canEdit) return null;

// Wrong — never gate API calls based on client permission hooks
// Server always enforces; client is UX convenience only
```

### Permission check location
| Layer | Purpose | Tools |
|---|---|---|
| Middleware (edge) | JWT signature verify | `jwtVerify()` |
| API route | Auth + RBAC enforcement | `requireSession()` + `requirePermission()` |
| Server Component | UI gating (server-side) | `canManage*()` helpers directly |
| Client Component | UI gating (client-side) | `usePermission()` hook |

---

## Adding New Permissions

When adding a new CMS module, follow this sequence:

1. Add permission strings to `types/auth.ts` `Permission` type union
2. Add to `ROLE_PERMISSIONS` in `lib/auth/rbac.ts` for each role
3. Add named helper to `lib/auth/permissions.ts` (e.g. `canManageWidgets`)
4. Use helper in API routes and server components
5. Add corresponding `usePermission()` calls in client components
6. Update this document

Never add permissions to RBAC without corresponding helper functions.
Never add helper functions without updating RBAC.

---

## Future Roles

Reserved role names for future expansion:

| Role | Intended scope |
|---|---|
| `branch_manager` | Admin-level for one branch only (`clinicId`-scoped) |
| `billing` | Read-only appointments + payment records |
| `nurse` | Limited appointment update (status transitions only) |
| `marketing` | `content_manager` + analytics.read |

These are not implemented. Defined here to prevent naming conflicts.
