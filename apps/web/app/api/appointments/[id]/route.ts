import { type NextRequest, type NextResponse } from "next/server";
import { requireSession }    from "@/lib/auth/session";
import { requirePermission } from "@/lib/auth/rbac";
import { ok }                from "@/lib/api/responses";
import { handleRouteError }  from "@/lib/api/errors";
import { parseBody, parseObjectId } from "@/lib/api/validators";
import { NotFoundError }     from "@/lib/security/errors";
import { connectDB }         from "@/lib/db/connection";
import { Appointment }       from "@/models/Appointment";
import { appointmentStatusUpdateSchema } from "@/lib/validations";
import { invalidateCmsCache } from "@/lib/cms/cache";
import { emitCmsAudit }      from "@/lib/cms/audit";
import { APPOINTMENT_CACHE, appointmentStatusConfig } from "@/features/appointments/config/appointments.config";
import { APPOINTMENT_TRANSITIONS } from "@/features/appointments/service/appointments.service";
import { isValidTransition } from "@/lib/cms/types";
import { mapAppointmentDetail } from "@/lib/db/mappers";
import type { AppointmentStatus } from "@/features/appointments/service/appointments.service";
import { notifyAppointmentConfirmed } from "@/features/appointment/server/notify";

export const dynamic = "force-dynamic";

export async function GET(_req: NextRequest, ctx: { params: Promise<{ id: string }> }): Promise<NextResponse> {
  try {
    const session = await requireSession();
    requirePermission(session.role, "appointments.read");
    const { id } = await ctx.params; parseObjectId(id);
    await connectDB();
    const raw = await Appointment.findById(id).lean();
    if (!raw) throw new NotFoundError("Appointment");
    // Detail DTO includes PII — admin detail view ONLY (list DTO excludes it)
    return ok(mapAppointmentDetail(raw));
  } catch (e) { return handleRouteError(e); }
}

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }): Promise<NextResponse> {
  try {
    const session = await requireSession();
    requirePermission(session.role, "appointments.update");
    const { id } = await ctx.params; parseObjectId(id);
    const body = await parseBody(req, appointmentStatusUpdateSchema);
    await connectDB();

    const raw = await Appointment.findById(id).lean();
    if (!raw) throw new NotFoundError("Appointment");
    const current = mapAppointmentDetail(raw);
    const currentStatus = current.status as AppointmentStatus;
    const newStatus     = body.status as AppointmentStatus;

    // Server-side transition enforcement
    if (!isValidTransition(appointmentStatusConfig, currentStatus, newStatus)) {
      const allowed = APPOINTMENT_TRANSITIONS[currentStatus] ?? [];
      return handleRouteError(Object.assign(
        new Error(`Cannot transition from "${currentStatus}" to "${newStatus}". Allowed: [${allowed.join(", ")}]`),
        { code: "VALIDATION_ERROR", statusCode: 422 }
      ));
    }

    // Business rule: approving requires a confirmed date + time
    if (newStatus === "approved" && (!body.confirmedDate || !body.confirmedTime)) {
      return handleRouteError(Object.assign(
        new Error("Approving an appointment requires confirmedDate and confirmedTime."),
        { code: "VALIDATION_ERROR", statusCode: 422,
          fields: { confirmedDate: "Required for approval", confirmedTime: "Required for approval" } }
      ));
    }

    const update: Record<string, unknown> = { status: newStatus };
    if (body.confirmedDate !== undefined) update.confirmedDate = body.confirmedDate;
    if (body.confirmedTime !== undefined) update.confirmedTime = body.confirmedTime;
    // Schema field is adminNotes; model field is notes (approved field, max 500)
    if (body.adminNotes) update.notes = body.adminNotes.slice(0, 500);

    const rawUpdated = await Appointment.findByIdAndUpdate(id, {
      $set: update,
      $push: { statusHistory: { status: newStatus, changedBy: session.userId, changedAt: new Date() } },
    }, { new: true }).lean();
    if (!rawUpdated) throw new NotFoundError("Appointment");
    const updated = mapAppointmentDetail(rawUpdated);

    // Patient confirmation — fire-and-forget, never blocks the mutation
    if (newStatus === "approved" && updated.confirmedDate && updated.confirmedTime) {
      void notifyAppointmentConfirmed({
        patientName: updated.patientName, email: updated.email, phone: updated.phone,
        confirmedDate: updated.confirmedDate, confirmedTime: updated.confirmedTime,
      }).catch(() => {});
    }

    invalidateCmsCache(APPOINTMENT_CACHE, "update");
    // Audit contains NO PII — status metadata only
    await emitCmsAudit({ actor: { id: session.userId, role: session.role }, action: "update",
      resource: "appointment", resourceId: id,
      meta: { previousStatus: currentStatus, newStatus } });

    return ok({ id: updated.id, status: updated.status,
      confirmedDate: updated.confirmedDate, confirmedTime: updated.confirmedTime });
  } catch (e) { return handleRouteError(e); }
}
