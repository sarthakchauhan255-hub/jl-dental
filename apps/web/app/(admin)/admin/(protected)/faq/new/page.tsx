import type { Metadata }      from "next";
import { redirect }           from "next/navigation";
import { getAuthUser }        from "@/lib/auth/session";
import { FaqCreateClient } from "@/components/cms/engine/clients/faq-create-client";
import { hasPermission }      from "@/lib/auth/rbac";

export const metadata: Metadata = { title: "Add FAQ | Admin", robots: { index:false, follow:false } };

export default async function NewFaqPage() {
  const user = await getAuthUser();
  if (!user || !hasPermission(user.role, "faq.create")) redirect("/admin/faq");
  return (
    <FaqCreateClient />
  );
}
