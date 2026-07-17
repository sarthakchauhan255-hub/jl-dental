"use client";
/**
 * FaqCreateClient — client boundary for the faq "new" page.
 * config/service/schema/form-fields all contain functions, which cannot be
 * passed from a Server Component. They are imported here on the client instead.
 */
import { ResourceCreatePage } from "@/components/cms/engine";
import { faqConfig } from "@/features/faq/config/faq.config";
import { faqService } from "@/features/faq/service/faq.service";
import { FaqFormFields } from "@/features/faq/components/faq-form-fields";
import { faqCreateSchema } from "@/lib/validations";
import type { ZodSchema } from "zod";
import type { FaqInput } from "@/features/faq/service/faq.service";

export function FaqCreateClient() {
  return (
    <ResourceCreatePage
      config={faqConfig}
      service={faqService}
      schema={faqCreateSchema as unknown as ZodSchema<FaqInput>}
    >
      {handle => <FaqFormFields handle={handle} />}
    </ResourceCreatePage>
  );
}
