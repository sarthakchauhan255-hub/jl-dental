"use client";
/**
 * ServiceCreateClient — client boundary for the services "new" page.
 * config/service/schema/form-fields all contain functions, which cannot be
 * passed from a Server Component. They are imported here on the client instead.
 */
import { ResourceCreatePage } from "@/components/cms/engine";
import { serviceConfig } from "@/features/services/config/services.config";
import { serviceService } from "@/features/services/service/services.service";
import { ServiceFormFields } from "@/features/services/components/service-form-fields";
import { serviceCreateSchema } from "@/lib/validations";
import type { ZodSchema } from "zod";
import type { ServiceInput } from "@/features/services/service/services.service";

export function ServiceCreateClient() {
  return (
    <ResourceCreatePage
      config={serviceConfig}
      service={serviceService}
      schema={serviceCreateSchema as unknown as ZodSchema<ServiceInput>}
    >
      {handle => <ServiceFormFields handle={handle} />}
    </ResourceCreatePage>
  );
}
