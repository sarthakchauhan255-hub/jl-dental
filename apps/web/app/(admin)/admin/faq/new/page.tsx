import type { Metadata }      from "next";
import { redirect }           from "next/navigation";
import { getAuthUser }        from "@/lib/auth/session";
import { hasPermission }      from "@/lib/auth/rbac";
import { ResourceCreatePage } from "@/components/cms/engine";
import { faqConfig }          from "@/features/faq/config/faq.config";
import { faqService }         from "@/features/faq/service/faq.service";
import { FaqFormFields }      from "@/features/faq/components/faq-form-fields";
import { faqCreateSchema }    from "@/lib/validations";

export const metadata: Metadata = { title: "Add FAQ | Admin", robots: { index:false, follow:false } };

export default async function NewFaqPage() {
  const user = await getAuthUser();
  if (!user || !hasPermission(user.role, "faq.create")) redirect("/admin/faq");
  return (
    <ResourceCreatePage config={faqConfig} service={faqService} schema={faqCreateSchema}>
      {handle => <FaqFormFields handle={handle} />}
    </ResourceCreatePage>
  );
}
