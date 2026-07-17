import type { Metadata } from "next";
import { redirect }      from "next/navigation";
import { getAuthUser }   from "@/lib/auth/session";
import { hasPermission } from "@/lib/auth/rbac";
import { ServicesListClient } from "@/components/cms/engine/clients/services-list-client";
import { connectDB }     from "@/lib/db/connection";
import { Service }      from "@/models/Service";
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
    <ServicesListClient
      initialData={initialData}
      initialTotal={total}
      user={user}
    />
  );
}
