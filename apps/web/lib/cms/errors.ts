/**
 * CMS Error system.
 *
 * Typed errors for every failure mode in the CRUD engine.
 * Modules receive these; the engine produces them.
 */

export type CmsErrorType =
  | "validation"
  | "permission"
  | "not_found"
  | "conflict"       // duplicate slug, unique constraint
  | "network"
  | "server"
  | "stale"          // resource changed since last fetch
  | "transition"     // invalid status transition
  | "deleted";       // resource has been deleted

export interface CmsError {
  type:    CmsErrorType;
  message: string;
  fields?: Record<string, string>;  // field-level errors (validation only)
  code?:   string;
}

/** Convert an API error response to a typed CmsError. */
export function parseCmsError(response: {
  success: false;
  error:   string;
  code?:   string;
  fields?: Record<string, string>;
}): CmsError {
  if (response.fields) {
    return { type: "validation", message: response.error, fields: response.fields };
  }
  switch (response.code) {
    case "FORBIDDEN":       return { type: "permission",  message: response.error };
    case "NOT_FOUND":       return { type: "not_found",   message: response.error };
    case "CONFLICT":        return { type: "conflict",    message: response.error };
    case "VALIDATION_ERROR":return { type: "validation",  message: response.error, fields: response.fields };
    default:                return { type: "server",      message: response.error ?? "An unexpected error occurred." };
  }
}

/** User-facing message for each error type. */
export function getCmsErrorMessage(error: CmsError, resourceLabel = "item"): string {
  switch (error.type) {
    case "validation": return error.message || "Please fix the highlighted fields.";
    case "permission": return `You don't have permission to perform this action.`;
    case "not_found":  return `This ${resourceLabel} no longer exists. It may have been deleted.`;
    case "conflict":   return `A ${resourceLabel} with this URL already exists. Please use a unique slug.`;
    case "network":    return "Network error. Please check your connection and try again.";
    case "transition": return error.message || "This status change is not allowed.";
    case "deleted":    return `This ${resourceLabel} has been deleted.`;
    default:           return "An unexpected error occurred. Please try again.";
  }
}
