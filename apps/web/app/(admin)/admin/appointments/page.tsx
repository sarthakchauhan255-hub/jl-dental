import type { Metadata }    from "next";
import { redirect }         from "next/navigation";
import { getAuthUser }      from "@/lib/auth/session";
import { hasPermission }    from "@/lib/auth/rbac";
import { connectDB }        from "@/lib/db/connection";
import { Appointment }      from "@/models/Appointment";
import { ResourceListPage } from "@/components/cms/engine";
import { appointmentConfig } from "@/features/appointments/config/appointments.config";
import { appointmentService } from "@/features/appointments/service/appointments.service";
import type { AppointmentRecord } from "@/features/appointments/service/appointments.service";
import { mapAppointmentList }      from "@/lib/db/mappers";

export const dynamic   = "force-dynamic";
export const metadata: Metadata = { title: "Appointments | Admin", robots: { index: false, follow: false } };

export default async function AppointmentsAdminPage() {
  const user = await getAuthUser();
  if (!user || !hasPermission(user.role, "appointments.read")) redirect("/admin/dashboard");

  await connectDB();
  const [docs, total] = await Promise.all([
    Appointment.find().sort({ createdAt: -1 }).limit(10).lean(),
    Appointment.countDocuments(),
  ]);

  const initialData: AppointmentRecord[] = docs.map(mapAppointmentList) as unknown as AppointmentRecord[];

  return (
    <ResourceListPage
      config={appointmentConfig}
      service={appointmentService}
      initialData={initialData}
      initialTotal={total}
      user={user}
    />
  );
}
