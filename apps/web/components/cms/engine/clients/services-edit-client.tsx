"use client";
/**
 * ServiceEditClient — client boundary for the services edit page.
 * Receives ONLY serializable data (record, defaultValues); imports the
 * function-carrying config/service/schema/form-fields itself.
 */
import { ResourceEditPage } from "@/components/cms/engine";
import { serviceConfig } from "@/features/services/config/services.config";
import { serviceService } from "@/features/services/service/services.service";
import { ServiceFormFields } from "@/features/services/components/service-form-fields";
import { serviceUpdateSchema } from "@/lib/validations";
import type { ZodSchema } from "zod";
import type { ServiceRecord, ServiceInput } from "@/features/services/service/services.service";

export function ServiceEditClient({
  record, defaultValues,
}: {
  record: ServiceRecord;
  defaultValues: Partial<ServiceInput>;
}) {
  return (
    <ResourceEditPage
      config={serviceConfig}
      service={serviceService}
      schema={serviceUpdateSchema as unknown as ZodSchema<ServiceInput>}
      record={record}
      defaultValues={defaultValues}
    >
      {handle => <ServiceFormFields handle={handle} isEdit />}
    </ResourceEditPage>
  );
}
