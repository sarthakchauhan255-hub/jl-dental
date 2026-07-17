"use client";
/**
 * DoctorsListClient — client boundary for the doctors list page.
 *
 * WHY THIS EXISTS: config and service contain FUNCTIONS (cell renderers,
 * action executors, service methods). Next.js forbids passing functions from a
 * Server Component to a Client Component. This wrapper imports them on the
 * client side instead, so the server page only passes serializable data.
 */
import { ResourceListPage } from "@/components/cms/engine";
import { doctorConfig } from "@/features/doctors/config/doctors.config";
import { doctorService } from "@/features/doctors/service/doctors.service";
import type { DoctorRecord } from "@/features/doctors/service/doctors.service";
import type { AuthUser } from "@/types/auth";

export function DoctorsListClient({
  initialData, initialTotal, user,
}: {
  initialData: DoctorRecord[];
  initialTotal: number;
  user: AuthUser | null;
}) {
  return (
    <ResourceListPage
      config={doctorConfig}
      service={doctorService}
      initialData={initialData}
      initialTotal={initialTotal}
      user={user}
    />
  );
}
