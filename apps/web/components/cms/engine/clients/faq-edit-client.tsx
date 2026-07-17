"use client";
/**
 * FaqEditClient — client boundary for the faq edit page.
 * Receives ONLY serializable data (record, defaultValues); imports the
 * function-carrying config/service/schema/form-fields itself.
 */
import { ResourceEditPage } from "@/components/cms/engine";
import { faqConfig } from "@/features/faq/config/faq.config";
import { faqService } from "@/features/faq/service/faq.service";
import { FaqFormFields } from "@/features/faq/components/faq-form-fields";
import { faqUpdateSchema } from "@/lib/validations";
import type { ZodSchema } from "zod";
import type { FaqRecord, FaqInput } from "@/features/faq/service/faq.service";

export function FaqEditClient({
  record, defaultValues,
}: {
  record: FaqRecord;
  defaultValues: Partial<FaqInput>;
}) {
  return (
    <ResourceEditPage
      config={faqConfig}
      service={faqService}
      schema={faqUpdateSchema as unknown as ZodSchema<FaqInput>}
      record={record}
      defaultValues={defaultValues}
    >
      {handle => <FaqFormFields handle={handle} />}
    </ResourceEditPage>
  );
}
