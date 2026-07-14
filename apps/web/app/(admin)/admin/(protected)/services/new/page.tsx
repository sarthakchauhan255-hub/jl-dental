import type { Metadata }      from "next";
import { redirect }           from "next/navigation";
import { getAuthUser }        from "@/lib/auth/session";
import { hasPermission }      from "@/lib/auth/rbac";
import { ResourceCreatePage } from "@/components/cms/engine";
import { serviceConfig }      from "@/features/services/config/services.config";
import { serviceService }     from "@/features/services/service/services.service";
import { ServiceFormFields }  from "@/features/services/components/service-form-fields";
import { serviceCreateSchema } from "@/lib/validations";

export const metadata: Metadata = { title: "Add Service | Admin", robots: { index:false, follow:false } };

export default async function NewServicePage() {
  const user = await getAuthUser();
  if (!user || !hasPermission(user.role, "services.create")) redirect("/admin/services");
  return (
    <ResourceCreatePage config={serviceConfig} service={serviceService} schema={serviceCreateSchema}>
      {handle => <ServiceFormFields handle={handle} />}
    </ResourceCreatePage>
  );
}
