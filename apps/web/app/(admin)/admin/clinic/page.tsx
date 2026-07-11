import Link from "next/link";
import type { Metadata }      from "next";
import { Settings }            from "lucide-react";
import { getAuthUser }         from "@/lib/auth/session";
import { canEditClinicConfig } from "@/lib/auth/permissions";
import { connectDB }           from "@/lib/db/connection";
import { Clinic }              from "@/models/Clinic";
import { TECH }                from "@/config/technical";
import { PageHeader }          from "@/components/cms/page-header";
import { PageContainer }       from "@/components/cms/page-container";
import { CmsBreadcrumb }       from "@/components/cms/breadcrumb";
import { ClinicSettingsForm }  from "@/features/clinic/components/clinic-settings-form";
import { redirect }            from "next/navigation";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Clinic Settings | Admin",
  robots: { index: false, follow: false },
};

export default async function ClinicSettingsPage() {
  const user = await getAuthUser();
  if (!user || !canEditClinicConfig(user)) redirect("/admin/dashboard");

  await connectDB();
  const clinic = await Clinic.findOne({ slug: TECH.DEFAULT_CLINIC_SLUG }).lean();

  return (
    <PageContainer>
      <PageHeader
        actions={<Link href="/admin/clinic/homepage" className="text-sm font-medium text-primary-700 hover:text-primary-800">Edit Homepage →</Link>}
        icon={Settings}
        title="Clinic Settings"
        description="Manage clinic information, contact details, and business hours."
        breadcrumb={
          <CmsBreadcrumb items={[
            { label: "Admin", href: "/admin/dashboard" },
            { label: "Clinic Settings" },
          ]} />
        }
      />
      <ClinicSettingsForm initialData={clinic ? JSON.parse(JSON.stringify(clinic)) : null} />
    </PageContainer>
  );
}
