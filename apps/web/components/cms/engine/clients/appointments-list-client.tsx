"use client";
/**
 * AppointmentsListClient — client boundary for the appointments list page.
 *
 * WHY THIS EXISTS: config and service contain FUNCTIONS (cell renderers,
 * action executors, service methods). Next.js forbids passing functions from a
 * Server Component to a Client Component. This wrapper imports them on the
 * client side instead, so the server page only passes serializable data.
 */
import { ResourceListPage } from "@/components/cms/engine";
import { appointmentConfig } from "@/features/appointments/config/appointments.config";
import { appointmentService } from "@/features/appointments/service/appointments.service";
import type { AppointmentRecord } from "@/features/appointments/service/appointments.service";
import type { AuthUser } from "@/types/auth";

export function AppointmentsListClient({
  initialData, initialTotal, user,
}: {
  initialData: AppointmentRecord[];
  initialTotal: number;
  user: AuthUser | null;
}) {
  return (
    <ResourceListPage
      config={appointmentConfig}
      service={appointmentService}
      initialData={initialData}
      initialTotal={initialTotal}
      user={user}
    />
  );
}
