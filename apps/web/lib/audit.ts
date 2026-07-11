/**
 * Audit logging service.
 * Call after successful mutations to record what changed and who did it.
 * Failures are logged but never block the main operation.
 */
import { connectDB }  from "@/lib/db/connection";
import { logger }     from "@/lib/logger";
import type { AuditAction, AuditResource } from "@/models/AuditLog";
import type { UserRole } from "@/types/auth";
import mongoose from "mongoose";

export interface AuditEntry {
  clinicId?:     string | null;
  userId:        string;
  userEmail:     string;
  userRole:      UserRole;
  action:        AuditAction;
  resource:      AuditResource;
  resourceId:    string;
  resourceLabel: string;
  previousValue?: Record<string, unknown> | null;
  newValue?:     Record<string, unknown> | null;
  ip?:           string;
}

/**
 * Record an audit log entry.
 * Fire-and-forget — never await this in critical paths.
 */
export async function audit(entry: AuditEntry): Promise<void> {
  try {
    await connectDB();
    // Dynamic import to avoid circular dependency at module load time
    const { AuditLog } = await import("@/models/AuditLog");
    await AuditLog.create({
      clinicId:      entry.clinicId ?? null,
      userId:        new mongoose.Types.ObjectId(entry.userId),
      userEmail:     entry.userEmail,
      userRole:      entry.userRole,
      action:        entry.action,
      resource:      entry.resource,
      resourceId:    entry.resourceId,
      resourceLabel: entry.resourceLabel,
      previousValue: entry.previousValue ?? null,
      newValue:      entry.newValue ?? null,
      ip:            entry.ip ?? "unknown",
    });
  } catch (err) {
    // Audit failures must never break business operations
    logger.warn("[Audit] Failed to write audit log", { err: String(err), entry });
  }
}

/**
 * Record an auth event.
 */
export async function auditAuth(entry: {
  userId?:   string | null;
  email:     string;
  event:     string;
  success:   boolean;
  ip?:       string;
  userAgent?: string;
  meta?:     Record<string, unknown>;
}): Promise<void> {
  try {
    await connectDB();
    const { AuthLog } = await import("@/models/AuthLog");
    await AuthLog.create({
      userId:    entry.userId ? new mongoose.Types.ObjectId(entry.userId) : null,
      email:     entry.email,
      event:     (entry.event as unknown) as import('@/models/AuthLog').AuthEvent,
      success:   entry.success,
      ip:        entry.ip ?? "unknown",
      userAgent: entry.userAgent ?? "",
      meta:      entry.meta ?? {},
    });
  } catch (err) {
    logger.warn("[Audit] Failed to write auth log", { err: String(err) });
  }
}

interface CmsAuditEntry {
  userId:     string;
  action:     "create" | "update" | "delete" | "publish" | "archive";
  resource:   string;
  resourceId?: string;
  meta?:      Record<string, unknown>;
}

export async function auditAction(entry: CmsAuditEntry): Promise<void> {
  import("./db/connection")
    .then(({ connectDB }) => connectDB())
    .then(() => import("../models/AuditLog"))
    .then(({ AuditLog }) => (AuditLog as unknown as { create: (d: unknown) => Promise<unknown> }).create({
      userId:     entry.userId,
      action:     entry.action,
      resource:   entry.resource,
      resourceId: entry.resourceId ?? null,
      meta:       entry.meta ?? {},
    }))
    .catch((err: unknown) => {
      import("./logger").then(({ logger }) =>
        logger.warn("[Audit] CMS audit write failed", { err: String(err) })
      );
    });
}
