/**
 * CMS Validation Engine.
 *
 * FOUR LAYER ARCHITECTURE (documented here, enforced by separation):
 *
 * 1. UI VALIDATION (CmsField, CmsForm)
 *    - Zod via zodResolver at form submission time
 *    - Immediate feedback only — NEVER trusted for security
 *    - Resides in: components/cms/engine/form/
 *
 * 2. SCHEMA VALIDATION (API boundary)
 *    - parseBody(req, schema) in every API route handler
 *    - Validates shape, types, required fields, formats
 *    - Returns 422 + field map on failure
 *    - Resides in: lib/api/validators.ts + lib/validations/index.ts
 *
 * 3. BUSINESS VALIDATION (resource service layer)
 *    - Domain rules: "cannot publish without SEO title"
 *    - Status transition validity (isValidTransition)
 *    - Cannot delete the last superadmin, etc.
 *    - Resides in: features/{resource}/services/ or API route handlers
 *    - NEVER in CMS engine code
 *
 * 4. DATABASE VALIDATION (Mongoose schema constraints)
 *    - unique indexes, required, enum, maxlength
 *    - Provides ultimate persistence safety net
 *    - Resides in: models/
 *
 * This file provides utilities for layers 1 and 2 only.
 * Layers 3 and 4 are resource and model concerns.
 */
import type { ZodSchema } from "zod";

// ─── Layer 1 + 2 utilities ────────────────────────────────────────────────────

/** Parse a Zod schema and return typed result or field error map. */
export function validateWithSchema<T>(
  schema: ZodSchema<T>,
  data:   unknown,
): { valid: true; data: T } | { valid: false; errors: Record<string, string> } {
  const result = schema.safeParse(data);
  if (result.success) return { valid: true, data: result.data };

  const errors: Record<string, string> = {};
  for (const issue of result.error.issues) {
    const path = issue.path.join(".");
    if (!errors[path]) errors[path] = issue.message;
  }
  return { valid: false, errors };
}

/** Auto-generate a URL slug from a display name. */
export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 120);
}

/** Validate a slug format. */
export function isValidSlug(slug: string): boolean {
  return /^[a-z0-9][a-z0-9-]*[a-z0-9]$/.test(slug) && slug.length >= 2 && slug.length <= 120;
}

/** Coerce empty strings to undefined for optional fields before API submission. */
export function coerceEmpty<T extends Record<string, unknown>>(obj: T): Partial<T> {
  const result: Record<string, unknown> = {};
  for (const [key, val] of Object.entries(obj)) {
    result[key] = (val === "" || val === null) ? undefined : val;
  }
  return result as Partial<T>;
}
