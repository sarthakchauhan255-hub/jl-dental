import type { Metadata }      from "next";
import { notFound, redirect } from "next/navigation";
import { getAuthUser }        from "@/lib/auth/session";
import { FaqEditClient } from "@/components/cms/engine/clients/faq-edit-client";
import { hasPermission }      from "@/lib/auth/rbac";
import { mapFaq } from "@/lib/db/mappers";
import { connectDB }          from "@/lib/db/connection";
import { FAQ }                from "@/models/FAQ";
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
  const dto = mapFaq(doc);
  return (
    <FaqEditClient
      record={dto}
      defaultValues={{ question:doc.question, answer:doc.answer,
        category:doc.category??"General", order:doc.order, isActive:doc.isActive }}
    />
  );
}
