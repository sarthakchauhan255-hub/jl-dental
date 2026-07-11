/**
 * CMS Engine — Core type system.
 *
 * ARCHITECTURE RULES:
 *  • No business-specific status strings (draft/published/approved/etc.) live here.
 *  • Resources declare their own status definitions as TStatus type parameters.
 *  • The engine is generic over TStatus — it never interprets business meaning.
 *  • No "any" types.
 */
import type { LucideIcon }  from "lucide-react";
import type { ZodSchema }   from "zod";
import type { Permission }  from "@/types/auth";

// ─── Badge Variant ─────────────────────────────────────────────────────────────
// Semantic badge variants — defined here, styled in the Badge component.
// Resources map their status to ONE of these variants.
export type CmsBadgeVariant = "success" | "warning" | "error" | "info" | "neutral";

// ─── Generic Status Definition ────────────────────────────────────────────────
// Resources define TStatus as their own string literal union (e.g. "draft" | "published")
// then provide a CmsStatusDefinition<TStatus> for each value.
export interface CmsStatusDefinition<TStatus extends string> {
  value:              TStatus;
  label:              string;
  badgeVariant:       CmsBadgeVariant;
  /** Statuses this one can transition to. Engine validates before calling service. */
  allowedTransitions: TStatus[];
  /** Terminal statuses cannot change. */
  terminal?:          boolean;
  /** Whether this status means the record appears on the public website. */
  isPublic?:          boolean;
}

// ─── Status Config ─────────────────────────────────────────────────────────────
// Resource-provided configuration for the status system.
export interface CmsStatusConfig<TStatus extends string> {
  /** Field name on the record that holds the status value */
  field:         keyof CmsRecord;
  definitions:   CmsStatusDefinition<TStatus>[];
  /** Default status when creating a new record */
  defaultStatus: TStatus;
}

/** Resolve status definition from a resource's status config. Returns undefined if not found. */
export function resolveStatusDef<TStatus extends string>(
  config:  CmsStatusConfig<TStatus>,
  value:   unknown
): CmsStatusDefinition<TStatus> | undefined {
  return config.definitions.find(d => d.value === value);
}

/** Check whether a status transition is allowed. */
export function isValidTransition<TStatus extends string>(
  config: CmsStatusConfig<TStatus>,
  from:   TStatus,
  to:     TStatus
): boolean {
  const def = resolveStatusDef(config, from);
  return def?.allowedTransitions.includes(to) ?? false;
}

// ─── Base Record ─────────────────────────────────────────────────────────────
export interface CmsRecord {
  id:         string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
  [key: string]: unknown;
}

// ─── Composable Resource Config ───────────────────────────────────────────────

/** Core identity — always required */
export interface CmsResourceMetadata {
  /** e.g. "Doctor" */
  label:      string;
  /** e.g. "Doctors" */
  labelPlural:string;
  /** Navigation icon component */
  icon:       LucideIcon;
}

/** Routing — always required */
export interface CmsResourceRoutes {
  /** e.g. "/api/doctors" */
  apiPath:   string;
  /** e.g. "/admin/doctors" */
  adminPath: string;
}

/** Permission descriptors — always required, typed against existing RBAC */
export interface CmsResourcePermissions {
  read:     Permission;
  create:   Permission;
  update:   Permission;
  delete:   Permission;
  /** Falls back to update permission if not specified */
  publish?: Permission;
  archive?: Permission;
}

/** Table configuration */
export interface CmsTableConfig<T extends CmsRecord> {
  columns:      CmsTableColumn<T>[];
  /** Field used as the human-readable name in confirmations and headings */
  displayField: keyof T;
  search?: {
    placeholder: string;
    /** Fields searched server-side (passed as q param) */
    fields:      (keyof T)[];
  };
  filters?:     CmsFilterDefinition[];
  defaultSort?: { field: keyof T; direction: "asc" | "desc" };
  /** Items per page. Defaults to 10. */
  pageSize?:    number;
}

/** Form configuration */
export interface CmsFormConfig<T extends CmsRecord> {
  fields: CmsFormField[];
  /** Additional sections beyond standard field list — for resource-specific SectionCards */
  sections?: CmsFormSection[];
}

/** Cache invalidation declaration */
export interface CmsCacheConfig {
  /** Cache tags to revalidate after any write on this resource */
  tags:          string[];
  /** Additional tags for specific operations */
  onPublish?:    string[];
  onDelete?:     string[];
}

/** Audit declaration */
export interface CmsAuditConfig {
  /** Readable resource name in audit logs */
  resourceName: string;
  /** Fields to omit from before/after diff (e.g. passwords, secrets) */
  excludeFromDiff?: string[];
}

/** Top-level resource configuration — composes the above */
export interface CmsResourceConfig<T extends CmsRecord, TStatus extends string = string> {
  // required
  meta:        CmsResourceMetadata;
  routes:      CmsResourceRoutes;
  permissions: CmsResourcePermissions;
  table:       CmsTableConfig<T>;
  cache:       CmsCacheConfig;

  // optional capabilities
  form?:       CmsFormConfig<T>;
  status?:     CmsStatusConfig<TStatus>;
  /** Simple boolean active/inactive toggle — alternative to full status system */
  activeField?: keyof T;
  audit?:      CmsAuditConfig;
  /** URL on the public website for the record (used for "View on site" link) */
  publicUrl?:  (record: T) => string;
  /** Registered actions — engine renders and dispatches these */
  actions?:    CmsActionDefinition<T>[];
  /** Lifecycle hooks */
  hooks?:      CmsLifecycleHooks<T>;
  /** Extension render slots */
  slots?:      CmsExtensionSlots;
}

// ─── Table column ────────────────────────────────────────────────────────────
export interface CmsTableColumn<T extends CmsRecord> {
  key:         string;
  header:      string;
  sortable?:   boolean;
  responsive?: boolean;  // hide on small screens
  cell:        (record: T) => React.ReactNode;
  width?:      string;
}

// ─── Filters ─────────────────────────────────────────────────────────────────
export type CmsFilterType = "select" | "boolean" | "status" | "date_range";

export interface CmsFilterDefinition {
  key:      string;
  label:    string;
  type:     CmsFilterType;
  options?: Array<{ label: string; value: string }>;
}

// ─── Form fields ─────────────────────────────────────────────────────────────
export type CmsFieldType =
  | "text" | "textarea" | "number" | "email" | "url"
  | "slug"        // auto-derives from slugSource field
  | "select" | "multiselect" | "toggle"
  | "date"
  | "media"       // single image — upload handled by engine
  | "tags"        // string[]
  | "rich_text"   // future: editor swap point
  | "relation"    // foreign-key lookup
  | "json";       // raw JSON — admin only

export interface CmsFormField {
  name:          string;
  label:         string;
  type:          CmsFieldType;
  required?:     boolean;
  hint?:         string;
  placeholder?:  string;
  slugSource?:   string;   // for type=slug: derive from this field name
  options?:      Array<{ label: string; value: string }>;
  uploadFolder?: string;   // for type=media: Cloudinary folder
  /** Lock field after first save — slug immutability */
  immutableAfterCreate?: boolean;
  /** Conditional display — receives current form values */
  showWhen?:     (values: Record<string, unknown>) => boolean;
  /** Relation config — for type=relation */
  relation?: {
    apiPath:      string;
    labelField:   string;
    multiple?:    boolean;
  };
}

export interface CmsFormSection {
  title:        string;
  description?: string;
  fields:       string[];  // field names from CmsFormField[]
}

// ─── Actions ─────────────────────────────────────────────────────────────────
export type CmsActionScope = "row" | "bulk" | "page";

export interface CmsActionDefinition<T extends CmsRecord> {
  id:          string;   // unique within resource — e.g. "activate", "approve", "feature"
  label:       string;
  icon?:       LucideIcon;
  scope:       CmsActionScope[];
  /** Permission required. Checked client-side for visibility only. Server always enforces. */
  permission?: Permission;
  destructive?: boolean;
  confirm?: {
    title:       string;
    description: (record: T) => string;
  };
  /** Is this action available for this specific record? */
  isAvailable?: (record: T) => boolean;
  /** Is this action enabled for this specific record (visible but greyed if false)? */
  isEnabled?:   (record: T) => boolean;
  /**
   * Row action executor — called by the engine when the action is triggered.
   * The resource defines what happens (e.g. call service.update with domain fields).
   * Only "delete" has a default dispatch without an executor.
   * All other actions MUST provide an executor.
   */
  executor?: (record: T, service: import("./contracts").CmsResourceService<T>) => Promise<void>;
  /**
   * Bulk action executor — called when action is triggered for multiple records.
   * If not provided, engine calls executor() per record.
   */
  bulkExecutor?: (records: T[], service: import("./contracts").CmsResourceService<T>) => Promise<void>;
  /** Audit event type emitted after execution (for engine-level audit helpers) */
  auditAction?: "create" | "update" | "delete";
  /** Cache tags to invalidate after this action. Merged with resource cache.tags. */
  extraCacheTags?: string[];
}

// ─── Lifecycle Hooks ──────────────────────────────────────────────────────────
// Hooks are cross-cutting — NOT business logic.
// Business logic belongs in the resource service/API layer.
export interface CmsHookContext<T extends CmsRecord> {
  actor:      { id: string; role: string };
  resource:   string;
  record?:    T;
  input?:     Record<string, unknown>;
  requestId?: string;
}

export type CmsHookResult = void | { abort: true; reason: string };

export interface CmsLifecycleHooks<T extends CmsRecord> {
  beforeCreate?: (ctx: CmsHookContext<T>) => Promise<CmsHookResult>;
  afterCreate?:  (ctx: CmsHookContext<T>) => Promise<void>;
  beforeUpdate?: (ctx: CmsHookContext<T>) => Promise<CmsHookResult>;
  afterUpdate?:  (ctx: CmsHookContext<T>) => Promise<void>;
  beforeDelete?: (ctx: CmsHookContext<T>) => Promise<CmsHookResult>;
  afterDelete?:  (ctx: CmsHookContext<T>) => Promise<void>;
  afterAction?:  (ctx: CmsHookContext<T> & { actionId: string }) => Promise<void>;
}

// ─── Extension Slots ──────────────────────────────────────────────────────────
export interface CmsExtensionSlots {
  beforeHeader?:  React.ReactNode;
  afterHeader?:   React.ReactNode;
  toolbarStart?:  React.ReactNode;
  toolbarEnd?:    React.ReactNode;
  beforeContent?: React.ReactNode;
  afterContent?:  React.ReactNode;
  sidebar?:       React.ReactNode;
}

// ─── Query / Response ────────────────────────────────────────────────────────
export interface CmsListQuery {
  page?:   number;
  limit?:  number;
  q?:      string;
  sort?:   string;
  order?:  "asc" | "desc";
  [key: string]: string | number | boolean | undefined;
}

export interface CmsListResponse<T> {
  data:       T[];
  pagination: {
    page:       number;
    limit:      number;
    total:      number;
    totalPages: number;
  };
}

export interface CmsMutationResult<T = { id: string }> {
  success: boolean;
  data?:   T;
  error?:  string;
  fields?: Record<string, string>;
  code?:   string;
}

// ─── Action Factories ─────────────────────────────────────────────────────────
// Optional convenience helpers — resources use these to build common action
// definitions without reimplementing the same structure. These are utilities,
// NOT implicit engine behavior. Every action still requires an explicit executor.

/** Factory: creates a standard hard-delete action for a resource. */
export function createDeleteAction<T extends CmsRecord>(
  displayField: keyof T,
  permission?: import("@/types/auth").Permission,
): CmsActionDefinition<T> {
  return {
    id:          "delete",
    label:       "Delete",
    scope:       ["row", "bulk"],
    destructive: true,
    permission,
    confirm: {
      title:       "Delete permanently?",
      description: (r) => `"${String(r[displayField])}" will be permanently deleted. This cannot be undone.`,
    },
    // executor MUST be provided by the resource — engine has no implicit delete behavior
    // Resources call: createDeleteAction(...) and add executor: async (r, svc) => svc.delete(r.id)
  };
}

/** Factory: creates a standard soft-delete action. */
export function createSoftDeleteAction<T extends CmsRecord>(
  displayField: keyof T,
  permission?: import("@/types/auth").Permission,
): CmsActionDefinition<T> {
  return {
    id:          "soft-delete",
    label:       "Archive",
    scope:       ["row"],
    destructive: true,
    permission,
    confirm: {
      title:       "Archive item?",
      description: (r) => `"${String(r[displayField])}" will be hidden but not permanently deleted.`,
    },
    // executor MUST be provided by the resource — no implicit behavior
  };
}

/** Factory: creates a standard restore action. */
export function createRestoreAction<T extends CmsRecord>(
  displayField: keyof T,
  permission?: import("@/types/auth").Permission,
): CmsActionDefinition<T> {
  return {
    id:          "restore",
    label:       "Restore",
    scope:       ["row"],
    permission,
    // executor MUST be provided by the resource — no implicit behavior
  };
}
