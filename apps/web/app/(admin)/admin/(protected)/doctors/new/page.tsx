import type { Metadata }       from "next";
import { redirect }            from "next/navigation";
import { getAuthUser }         from "@/lib/auth/session";
import { DoctorCreateClient } from "@/components/cms/engine/clients/doctors-create-client";
import { hasPermission }       from "@/lib/auth/rbac";

export const metadata: Metadata = {
  title: "Add Doctor | Admin",
  robots: { index: false, follow: false },
};

export default async function NewDoctorPage() {
  const user = await getAuthUser();
  if (!user || !hasPermission(user.role, "doctors.create")) redirect("/admin/doctors");

  return (
    <DoctorCreateClient />
  );
}
