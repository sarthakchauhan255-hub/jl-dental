"use client";
/**
 * ServicesListClient — client boundary for the services list page.
 *
 * WHY THIS EXISTS: config and service contain FUNCTIONS (cell renderers,
 * action executors, service methods). Next.js forbids passing functions from a
 * Server Component to a Client Component. This wrapper imports them on the
 * client side instead, so the server page only passes serializable data.
 */
import { ResourceListPage } from "@/components/cms/engine";
import { serviceConfig } from "@/features/services/config/services.config";
import { serviceService } from "@/features/services/service/services.service";
import type { ServiceRecord } from "@/features/services/service/services.service";
import type { AuthUser } from "@/types/auth";

export function ServicesListClient({
  initialData, initialTotal, user,
}: {
  initialData: ServiceRecord[];
  initialTotal: number;
  user: AuthUser | null;
}) {
  return (
    <ResourceListPage
      config={serviceConfig}
      service={serviceService}
      initialData={initialData}
      initialTotal={initialTotal}
      user={user}
    />
  );
}
