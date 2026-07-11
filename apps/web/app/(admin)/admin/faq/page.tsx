import type { Metadata } from "next";
import { redirect }      from "next/navigation";
import { getAuthUser }   from "@/lib/auth/session";
import { hasPermission } from "@/lib/auth/rbac";
import { connectDB }     from "@/lib/db/connection";
import { FAQ }      from "@/models/FAQ";
import { ResourceListPage } from "@/components/cms/engine";
import { faqConfig }  from "@/features/faq/config/faq.config";
import { faqService } from "@/features/faq/service/faq.service";
import type { FaqRecord } from "@/features/faq/service/faq.service";
import { mapFaq }          from "@/lib/db/mappers";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "FAQ | Admin", robots: { index: false, follow: false } };

export default async function FaqAdminPage() {
  const user = await getAuthUser();
  if (!user || !hasPermission(user.role, "faq.read")) redirect("/admin/dashboard");

  await connectDB();
  const [docs, total] = await Promise.all([
    FAQ.find({}).sort({ order: 1 }).limit(10).lean(),
    FAQ.countDocuments({}),
  ]);

  const initialData: FaqRecord[] = docs.map(mapFaq);

  return (
    <ResourceListPage
      config={faqConfig}
      service={faqService}
      initialData={initialData}
      initialTotal={total}
      user={user}
    />
  );
}
