import type { Metadata }      from "next";
import { redirect }           from "next/navigation";
import { getAuthUser }        from "@/lib/auth/session";
import { ServiceCreateClient } from "@/components/cms/engine/clients/services-create-client";
import { hasPermission }      from "@/lib/auth/rbac";

export const metadata: Metadata = { title: "Add Service | Admin", robots: { index:false, follow:false } };

export default async function NewServicePage() {
  const user = await getAuthUser();
  if (!user || !hasPermission(user.role, "services.create")) redirect("/admin/services");
  return (
    <ServiceCreateClient />
  );
}
