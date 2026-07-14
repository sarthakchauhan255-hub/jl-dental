import type { Metadata }       from "next";
import { redirect }            from "next/navigation";
import { getAuthUser }         from "@/lib/auth/session";
import { hasPermission }       from "@/lib/auth/rbac";
import { ResourceCreatePage }  from "@/components/cms/engine";
import { doctorConfig }        from "@/features/doctors/config/doctors.config";
import { doctorService }       from "@/features/doctors/service/doctors.service";
import { DoctorFormFields }    from "@/features/doctors/components/doctor-form-fields";
import { doctorCreateSchema }  from "@/lib/validations";

export const metadata: Metadata = {
  title: "Add Doctor | Admin",
  robots: { index: false, follow: false },
};

export default async function NewDoctorPage() {
  const user = await getAuthUser();
  if (!user || !hasPermission(user.role, "doctors.create")) redirect("/admin/doctors");

  return (
    <ResourceCreatePage
      config={doctorConfig}
      service={doctorService}
      schema={doctorCreateSchema}
    >
      {handle => <DoctorFormFields handle={handle} />}
    </ResourceCreatePage>
  );
}
