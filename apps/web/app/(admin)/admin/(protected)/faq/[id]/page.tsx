import type { Metadata }      from "next";
import { notFound, redirect } from "next/navigation";
import { getAuthUser }        from "@/lib/auth/session";
import { hasPermission }      from "@/lib/auth/rbac";
import { connectDB }          from "@/lib/db/connection";
import { FAQ }                from "@/models/FAQ";
import { ResourceEditPage }   from "@/components/cms/engine";
import { faqConfig }          from "@/features/faq/config/faq.config";
import { faqService }         from "@/features/faq/service/faq.service";
import { FaqFormFields }      from "@/features/faq/components/faq-form-fields";
import { faqUpdateSchema }    from "@/lib/validations";
import type { ZodSchema }      from "zod";
import type { FaqInput }       from "@/features/faq/service/faq.service";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Edit FAQ | Admin", robots: { index:false, follow:false } };

export default async function EditFaqPage({ params }: { params: Promise<{id:string}> }) {
  const user = await getAuthUser();
  if (!user || !hasPermission(user.role, "faq.update")) redirect("/admin/faq");
  const {id} = await params;
  await connectDB();
  const doc = await FAQ.findById(id).lean();
  if (!doc) notFound();
  return (
    <ResourceEditPage
      config={faqConfig} service={faqService} schema={faqUpdateSchema as unknown as ZodSchema<FaqInput>}
      record={{ id:String(doc._id), question:doc.question, answer:doc.answer,
        category:doc.category??"General", order:doc.order, isActive:doc.isActive }}
      defaultValues={{ question:doc.question, answer:doc.answer,
        category:doc.category??"General", order:doc.order, isActive:doc.isActive }}
    >
      {handle => <FaqFormFields handle={handle} />}
    </ResourceEditPage>
  );
}
