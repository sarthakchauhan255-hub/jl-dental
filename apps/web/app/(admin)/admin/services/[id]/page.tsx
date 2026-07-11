import type { Metadata }     from "next";
import { notFound, redirect } from "next/navigation";
import { getAuthUser }       from "@/lib/auth/session";
import { hasPermission }     from "@/lib/auth/rbac";
import { connectDB }         from "@/lib/db/connection";
import { Service }           from "@/models/Service";
import { ResourceEditPage }  from "@/components/cms/engine";
import { serviceConfig }     from "@/features/services/config/services.config";
import { serviceService }    from "@/features/services/service/services.service";
import { ServiceFormFields } from "@/features/services/components/service-form-fields";
import { serviceUpdateSchema } from "@/lib/validations";
import { mapService }           from "@/lib/db/mappers";
import type { ZodSchema } from "zod";
import type { ServiceInput } from "@/features/services/service/services.service";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Edit Service | Admin", robots: { index:false, follow:false } };

export default async function EditServicePage({ params }: { params: Promise<{id:string}> }) {
  const user = await getAuthUser();
  if (!user || !hasPermission(user.role, "services.update")) redirect("/admin/services");
  const {id} = await params;
  await connectDB();
  const rawDoc = await Service.findById(id).lean();
  if (!rawDoc) notFound();
  const dto = mapService(rawDoc);
  return (
    <ResourceEditPage
      config={serviceConfig} service={serviceService} schema={serviceUpdateSchema as unknown as ZodSchema<ServiceInput>}
      record={dto as unknown as import("@/features/services/service/services.service").ServiceRecord}
      defaultValues={{ name: dto.name, slug: dto.slug, shortDesc: dto.shortDesc,
        fullContent: dto.fullContent, icon: dto.icon, order: dto.order,
        isActive: dto.isActive, isFeatured: dto.isFeatured }}
    >
      {handle => <ServiceFormFields handle={handle} isEdit />}
    </ResourceEditPage>
  );
}
