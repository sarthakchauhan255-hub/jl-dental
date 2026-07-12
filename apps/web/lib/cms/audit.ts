/**
 * CMS Audit Integration.
 *
 * ARCHITECTURE:
 *  • ONE canonical audit persistence path: auditAction() from lib/audit.ts.
 *  • No second audit system.
 *  • Sensitive fields sanitized before persistence.
 *  • Resource services provide context; this module normalizes it.
 *  • Awaited persistence (serverless-safe) — but failures are swallowed:
 *    an audit error never breaks the API response.
 */
import type { CmsActionDefinition, CmsRecord } from "./types";

const SENSITIVE_FIELDS = ["password", "passwordHash", "token", "secret", "hash", "cookie", "jwt", "apiKey", "privateKey", "resetToken"] as const;

export interface CmsAuditContext {
  /** User performing the action */
  actor:      { id: string; role: string; email?: string };
  /** The action being performed — matches CmsActionDefinition.auditAction */
  action:     "create" | "update" | "delete" | "publish" | "archive";
  /** Canonical resource name (e.g. "doctor", "blog_post") from CmsAuditConfig */
  resource:   string;
  resourceId?: string;
  /** Before/after field changes — sensitive fields already removed */
  changes?:   Record<string, { from: unknown; to: unknown }>;
  /** Additional context from the resource/action */
  meta?:      Record<string, unknown>;
  /** HTTP request correlation ID if available */
  requestId?: string;
}

/**
 * Emit a CMS audit event through the canonical audit path.
 * Awaits persistence (lost-write-safe on serverless); errors logged, never rethrown.
 */
export async function emitCmsAudit(ctx: CmsAuditContext): Promise<void> {
  try {
    const { auditAction } = await import("@/lib/audit");
    await auditAction({
      userId:     ctx.actor.id,
      userRole:   ctx.actor.role,
      userEmail:  ctx.actor.email,
      action:     ctx.action,
      resource:   ctx.resource,
      resourceId: ctx.resourceId,
      meta: {
        ...(ctx.meta ?? {}),
        ...(ctx.changes ? { changes: ctx.changes } : {}),
        ...(ctx.requestId ? { requestId: ctx.requestId } : {}),
      },
    });
  } catch (err: unknown) {
    // Never let audit failure break the request
    const { logger } = await import("@/lib/logger");
    logger.warn("[CmsAudit] Audit write failed", {
      resource:   ctx.resource,
      resourceId: ctx.resourceId,
      action:     ctx.action,
      err:        String(err),
    });
  }
}

/**
 * Diff two record objects, excluding sensitive and timestamp fields.
 * Returns only fields that changed.
 */
export function diffRecords(
  prev: Record<string, unknown>,
  next: Record<string, unknown>,
  excludeFields: string[] = [],
): Record<string, { from: unknown; to: unknown }> {
  const excludeSet: Record<string, boolean> = { "updatedAt": true, "createdAt": true };
  for (const f of Array.from(SENSITIVE_FIELDS)) { excludeSet[f] = true; }
  for (const f of excludeFields) { excludeSet[f] = true; }
  const changes: Record<string, { from: unknown; to: unknown }> = {};

  const seenFields: Record<string, boolean> = {};
  const allKeys: string[] = [];
  for (const k of Object.keys(prev).concat(Object.keys(next))) {
    if (!seenFields[k]) { seenFields[k] = true; allKeys.push(k); }
  }
  for (const key of allKeys) {
    if (excludeSet[key]) continue;
    if (JSON.stringify(prev[key]) !== JSON.stringify(next[key])) {
      changes[key] = { from: prev[key], to: next[key] };
    }
  }
  return changes;
}

/**
 * Build audit metadata from a CmsActionDefinition.
 * Used by API routes to emit consistent audit events.
 */
export function buildActionAuditMeta<T extends CmsRecord>(
  action: CmsActionDefinition<T>,
  record: T,
): Record<string, unknown> {
  return {
    actionId:    action.id,
    actionLabel: action.label,
    resourceId:  record.id,
  };
}
