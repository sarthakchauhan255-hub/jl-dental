import { type NextRequest, type NextResponse } from "next/server";
import { requireSession }    from "@/lib/auth/session";
import { requirePermission } from "@/lib/auth/rbac";
import { ok, paginated }     from "@/lib/api/responses";
import { handleRouteError }  from "@/lib/api/errors";
import { parsePagination }   from "@/lib/api/pagination";
import { connectDB }         from "@/lib/db/connection";
import { Appointment }       from "@/models/Appointment";
import { mapAppointmentList } from "@/lib/db/mappers";
import { appointmentSchema }  from "@/lib/validations";
import { parseBody }          from "@/lib/api/validators";
import { applyRateLimit, getIdentifier, limiters } from "@/lib/security/rate-limit";
import { notifyAppointmentReceived } from "@/features/appointment/server/notify";
import { logger }             from "@/lib/logger";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    const session = await requireSession();
    requirePermission(session.role, "appointments.read");
    await connectDB();
    const { page, limit, skip } = parsePagination(req.nextUrl.searchParams);
    const status = req.nextUrl.searchParams.get("status");
    const filter: Record<string, unknown> = status ? { status } : {};
    const [docs, total] = await Promise.all([
      Appointment.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Appointment.countDocuments(filter),
    ]);
    // List uses PII-minimized DTO — no email/phone
    return paginated(docs.map(mapAppointmentList), page, limit, total);
  } catch (e) { return handleRouteError(e); }
}

/**
 * PUBLIC endpoint — patients submit booking requests here.
 * Protections: rate limit (3/hr/IP), Zod validation, honeypot, size-capped fields.
 * Created appointments always start as "pending" — status is never client-settable.
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const limited = await applyRateLimit(limiters.appointments, getIdentifier(req, "book"));
    if (limited) return limited;

    const body = await parseBody(req, appointmentSchema);

    // Honeypot tripped → pretend success, persist nothing (schema already rejects
    // non-empty, but belt-and-braces if schema config changes)
    if (body.honeypot) return ok({ received: true }, 201);

    await connectDB();
    const appt = await Appointment.create({
      patientName:    body.patientName,
      phone:          body.phone,
      email:          body.email,
      serviceId:      body.serviceId,
      preferredDate:  body.preferredDate,
      preferredTime:  body.preferredTime,
      urgencyLevel:   body.urgencyLevel,
      notes:          body.notes,
      isNewPatient:   body.isNewPatient,
      referralSource: body.referralSource,
      status:         "pending", // server-fixed — never from client
    });

    logger.info("[Appointments] Public booking received", { id: String(appt._id) }); // no PII

    // Fire-and-forget — notification failure never blocks the booking
    void notifyAppointmentReceived({
      patientName: body.patientName, email: body.email, phone: body.phone,
      preferredDate: body.preferredDate, preferredTime: body.preferredTime,
    }).catch(() => {});

    return ok({ received: true, reference: String(appt._id).slice(-6).toUpperCase() }, 201);
  } catch (e) { return handleRouteError(e); }
}
