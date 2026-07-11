import type { Metadata }      from "next";
import Link                    from "next/link";
import { notFound, redirect } from "next/navigation";
import { getAuthUser }        from "@/lib/auth/session";
import { hasPermission }      from "@/lib/auth/rbac";
import { connectDB }          from "@/lib/db/connection";
import { Appointment }        from "@/models/Appointment";
import { PageHeader }         from "@/components/cms/page-header";
import { SectionCard }        from "@/components/cms/section-card";
import { ResourceStatusBadge } from "@/components/cms/engine";
import { AppointmentDetailActions } from "@/features/appointments/components/appointment-detail-actions";
import { appointmentStatusConfig } from "@/features/appointments/config/appointments.config";
import { resolveStatusDef }   from "@/lib/cms/types";
import { mapAppointmentDetail } from "@/lib/db/mappers";
import type { AppointmentStatus } from "@/features/appointments/service/appointments.service";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Appointment | Admin", robots: { index: false, follow: false } };

export default async function AppointmentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getAuthUser();
  if (!user || !hasPermission(user.role, "appointments.read")) redirect("/admin/dashboard");

  const { id } = await params;
  await connectDB();
  const raw = await Appointment.findById(id).lean().catch(() => null);
  if (!raw) notFound();

  // Detail DTO includes PII — this page is admin-only, server-authorized above.
  const appt = mapAppointmentDetail(raw);
  const statusDef = resolveStatusDef(appointmentStatusConfig, appt.status as AppointmentStatus);
  const canUpdate = hasPermission(user.role, "appointments.update");

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Appointment — ${appt.patientName}`}
        description={`Requested ${appt.preferredDate} at ${appt.preferredTime}`}
        breadcrumb={
          <Link href="/admin/appointments" className="text-sm text-charcoal-500 hover:text-charcoal-800">
            ← Appointments
          </Link>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <SectionCard title="Patient">
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
              <div>
                <dt className="font-medium text-charcoal-500">Name</dt>
                <dd className="text-charcoal-900">{appt.patientName}</dd>
              </div>
              <div>
                <dt className="font-medium text-charcoal-500">Phone</dt>
                <dd className="text-charcoal-900">{appt.phone || "—"}</dd>
              </div>
              <div>
                <dt className="font-medium text-charcoal-500">Email</dt>
                <dd className="text-charcoal-900">{appt.email || "—"}</dd>
              </div>
              <div>
                <dt className="font-medium text-charcoal-500">Urgency</dt>
                <dd className="text-charcoal-900 capitalize">{appt.urgencyLevel}</dd>
              </div>
            </dl>
          </SectionCard>

          <SectionCard title="Request">
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
              <div>
                <dt className="font-medium text-charcoal-500">Service</dt>
                <dd className="text-charcoal-900">{appt.service || "—"}</dd>
              </div>
              <div>
                <dt className="font-medium text-charcoal-500">Preferred</dt>
                <dd className="text-charcoal-900">{appt.preferredDate} · {appt.preferredTime}</dd>
              </div>
              {appt.confirmedDate && (
                <div>
                  <dt className="font-medium text-charcoal-500">Confirmed</dt>
                  <dd className="text-charcoal-900">{appt.confirmedDate} · {appt.confirmedTime ?? "—"}</dd>
                </div>
              )}
              {appt.message && (
                <div className="sm:col-span-2">
                  <dt className="font-medium text-charcoal-500">Message</dt>
                  <dd className="whitespace-pre-wrap text-charcoal-900">{appt.message}</dd>
                </div>
              )}
            </dl>
          </SectionCard>
        </div>

        <div className="space-y-6">
          <SectionCard title="Status">
            <div className="flex items-center gap-3">
              {statusDef && <ResourceStatusBadge definition={statusDef} />}
              <span className="text-xs text-charcoal-500">
                Created {appt.createdAt ? new Date(appt.createdAt).toLocaleDateString("en-IN") : "—"}
              </span>
            </div>
          </SectionCard>

          {canUpdate && (
            <AppointmentDetailActions
              appointmentId={appt.id}
              currentStatus={appt.status as AppointmentStatus}
              confirmedDate={appt.confirmedDate}
              confirmedTime={appt.confirmedTime}
              notes={appt.notes}
            />
          )}
        </div>
      </div>
    </div>
  );
}
