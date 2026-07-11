/**
 * CMS Resource Registry + Invariant Validation.
 *
 * REGISTRY TYPING DESIGN:
 *  The registry stores heterogeneous resource configurations at runtime.
 *  CmsResourceConfig<T> uses T as a function parameter (columns[].cell, actions[].executor)
 *  which makes it contravariant — CmsResourceConfig<unknown> is NOT assignable to
 *  CmsResourceConfig<CmsRecord> in strict TypeScript.
 *
 *  Solution: the registry stores only RuntimeResourceMeta — a flat non-generic structure
 *  extracted from the full config at registration time. It contains only the fields needed
 *  for:
 *    - resource identity and route uniqueness validation
 *    - status/action/field duplicate detection
 *    - permission descriptor validation
 *    - cache descriptor validation
 *    - future resource lookup by route/id
 *
 *  The full generic config<T> is validated with correct typing at registerCmsResource(),
 *  then its static metadata is extracted and stored generically.
 *  No `any` anywhere in this file.
 */
import type { CmsResourceConfig, CmsRecord } from "./types";

// ─── Non-generic runtime metadata ────────────────────────────────────────────
// Contains only the structural/string/object fields used by the registry.
// Functions that carry T (cell renderers, executors) are NOT stored here.
interface RuntimeResourceMeta {
  id:          string;
  label:       string;
  labelPlural: string;
  apiPath:     string;
  adminPath:   string;
  permissions: {
    read:    string;
    create:  string;
    update:  string;
    delete:  string;
  };
  columnKeys:  string[];
  displayField:string;
  cacheTags:   string[];
  actionIds:   string[];
  statusValues:string[];
  formFieldNames: string[];
}

// ─── Private store — non-generic, no any ─────────────────────────────────────
const registry = new Map<string, RuntimeResourceMeta>();

// ─── Public types ─────────────────────────────────────────────────────────────
export interface RegistryValidationError {
  resourceId: string;
  field:      string;
  message:    string;
}

// ─── Registration ─────────────────────────────────────────────────────────────
/**
 * Register a CMS resource. Validates the full generic config immediately,
 * then extracts and stores non-generic runtime metadata.
 */
export function registerCmsResource<T extends CmsRecord>(
  id:     string,
  config: CmsResourceConfig<T>,
): void {
  if (registry.has(id)) {
    throw new Error(`[CmsRegistry] Duplicate resource ID: "${id}". IDs must be unique.`);
  }

  // Check for duplicate route segments across existing resources
  for (const [existingId, existing] of Array.from(registry.entries())) {
    if (existing.adminPath === config.routes.adminPath) {
      throw new Error(
        `[CmsRegistry] Duplicate adminPath "${config.routes.adminPath}": ` +
        `shared by "${id}" and "${existingId}".`
      );
    }
    if (existing.apiPath === config.routes.apiPath) {
      throw new Error(
        `[CmsRegistry] Duplicate apiPath "${config.routes.apiPath}": ` +
        `shared by "${id}" and "${existingId}".`
      );
    }
  }

  // Full config validation with correct T typing
  const errors = validateResourceConfig(id, config);
  if (errors.length > 0) {
    const msg = errors.map(e => `  [${e.resourceId}] ${e.field}: ${e.message}`).join("\n");
    throw new Error(`[CmsRegistry] Invalid resource config for "${id}":\n${msg}`);
  }

  // Extract non-generic runtime metadata — only strings/primitives
  const meta: RuntimeResourceMeta = {
    id,
    label:        config.meta.label,
    labelPlural:  config.meta.labelPlural,
    apiPath:      config.routes.apiPath,
    adminPath:    config.routes.adminPath,
    permissions:  {
      read:   config.permissions.read,
      create: config.permissions.create,
      update: config.permissions.update,
      delete: config.permissions.delete,
    },
    columnKeys:   config.table.columns.map(c => c.key),
    displayField: String(config.table.displayField),
    cacheTags:    [...config.cache.tags],
    actionIds:    (config.actions ?? []).map(a => a.id),
    statusValues: (config.status?.definitions ?? []).map(d => d.value),
    formFieldNames: (config.form?.fields ?? []).map(f => f.name),
  };

  registry.set(id, meta);
}

/** Retrieve runtime metadata for a registered resource by ID. */
export function getCmsResourceMeta(id: string): RuntimeResourceMeta | undefined {
  return registry.get(id);
}

/** All registered resource IDs. */
export function listCmsResources(): string[] {
  return Array.from(registry.keys());
}

/** Check whether a resource ID is registered. */
export function hasCmsResource(id: string): boolean {
  return registry.has(id);
}

// ─── Config validation ────────────────────────────────────────────────────────
export function validateResourceConfig<T extends CmsRecord>(
  id:     string,
  config: CmsResourceConfig<T>,
): RegistryValidationError[] {
  const errors: RegistryValidationError[] = [];

  function err(field: string, message: string) {
    errors.push({ resourceId: id, field, message });
  }

  // Meta
  if (!config.meta.label)       err("meta.label",       "Must be a non-empty string");
  if (!config.meta.labelPlural) err("meta.labelPlural", "Must be a non-empty string");
  if (!config.meta.icon)        err("meta.icon",        "Must provide a LucideIcon component");

  // Routes
  if (!config.routes.apiPath?.startsWith("/"))   err("routes.apiPath",   "Must start with /");
  if (!config.routes.adminPath?.startsWith("/")) err("routes.adminPath", "Must start with /");

  // Permissions
  if (!config.permissions.read)   err("permissions.read",   "Required");
  if (!config.permissions.create) err("permissions.create", "Required");
  if (!config.permissions.update) err("permissions.update", "Required");
  if (!config.permissions.delete) err("permissions.delete", "Required");

  // Table
  if (!config.table.columns?.length) err("table.columns", "At least one column required");
  if (!config.table.displayField)    err("table.displayField", "Required — used in confirmations");

  // Duplicate column keys
  const colKeys = config.table.columns.map(c => c.key);
  const dupCols = colKeys.filter((k, i) => colKeys.indexOf(k) !== i);
  if (dupCols.length > 0) err("table.columns", `Duplicate column keys: ${dupCols.join(", ")}`);

  // Cache
  if (!config.cache.tags?.length) err("cache.tags", "At least one cache tag required");

  // Status config
  if (config.status) {
    if (!config.status.field)               err("status.field",         "Required");
    if (!config.status.definitions?.length) err("status.definitions",   "At least one definition required");
    if (!config.status.defaultStatus)       err("status.defaultStatus", "Required");

    const statusValues = new Set(config.status.definitions.map(d => d.value));
    if (!statusValues.has(config.status.defaultStatus)) {
      err("status.defaultStatus", `"${String(config.status.defaultStatus)}" not found in definitions`);
    }
    for (const def of config.status.definitions) {
      for (const t of def.allowedTransitions) {
        if (!statusValues.has(t)) {
          err(`status.definitions[${String(def.value)}].allowedTransitions`, `"${String(t)}" not found in definitions`);
        }
      }
      const validVariants = ["success","warning","error","info","neutral"];
      if (!validVariants.includes(def.badgeVariant)) {
        err(`status.definitions[${String(def.value)}].badgeVariant`, `"${def.badgeVariant}" is not a valid CmsBadgeVariant`);
      }
    }
  }

  // Actions
  if (config.actions) {
    const actionIds = config.actions.map(a => a.id);
    const dupActions = actionIds.filter((id, i) => actionIds.indexOf(id) !== i);
    if (dupActions.length > 0) err("actions", `Duplicate action IDs: ${dupActions.join(", ")}`);
    for (const action of config.actions) {
      if (!action.id)    err(`actions[${action.id}].id`,    "Required");
      if (!action.label) err(`actions[${action.id}].label`, "Required");
      if (!action.scope?.length) err(`actions[${action.id}].scope`, "At least one scope required");
    }
  }

  // Form field names
  if (config.form?.fields) {
    const fieldNames = config.form.fields.map(f => f.name);
    const dupFields  = fieldNames.filter((n, i) => fieldNames.indexOf(n) !== i);
    if (dupFields.length > 0) err("form.fields", `Duplicate field names: ${dupFields.join(", ")}`);
  }

  return errors;
}
