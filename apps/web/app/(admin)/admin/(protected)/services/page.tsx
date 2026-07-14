import type { Metadata } from "next";
import { redirect }      from "next/navigation";
import { getAuthUser }   from "@/lib/auth/session";
import { hasPermission } from "@/lib/auth/rbac";
import { connectDB }     from "@/lib/db/connection";
import { Service }      from "@/models/Service";
import { ResourceListPage } from "@/components/cms/engine";
import { serviceConfig }  from "@/features/services/config/services.config";
import { serviceService } from "@/features/services/service/services.service";
import type { ServiceRecord } from "@/features/services/service/services.service";
import { mapService }          from "@/lib/db/mappers";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Services | Admin", robots: { index: false, follow: false } };

export default async function ServicesAdminPage() {
  const user = await getAuthUser();
  if (!user || !hasPermission(user.role, "services.read")) redirect("/admin/dashboard");

  await connectDB();
  const [docs, total] = await Promise.all([
    Service.find({}).sort({ order: 1, name: 1 }).limit(10).lean(),
    Service.countDocuments({}),
  ]);

  const initialData: ServiceRecord[] = docs.map(mapService);

  return (
    <ResourceListPage
      config={serviceConfig}
      service={serviceService}
      initialData={initialData}
      initialTotal={total}
      user={user}
    />
  );
}
