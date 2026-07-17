import type { Metadata }       from "next";
import { redirect }            from "next/navigation";
import { getAuthUser }         from "@/lib/auth/session";
import { hasPermission }       from "@/lib/auth/rbac";
import { DoctorsListClient } from "@/components/cms/engine/clients/doctors-list-client";
import { connectDB }           from "@/lib/db/connection";
import { Doctor }              from "@/models/Doctor";
import type { DoctorRecord }   from "@/features/doctors/service/doctors.service";
import { mapDoctor }            from "@/lib/db/mappers";

export const dynamic   = "force-dynamic";
export const metadata: Metadata = {
  title: "Doctors | Admin",
  robots: { index: false, follow: false },
};

export default async function DoctorsAdminPage() {
  const user = await getAuthUser();
  if (!user || !hasPermission(user.role, "doctors.read")) redirect("/admin/dashboard");

  await connectDB();
  const [docs, total] = await Promise.all([
    Doctor.find().sort({ order: 1, name: 1 }).limit(10).lean(),
    Doctor.countDocuments(),
  ]);

  const initialData: DoctorRecord[] = docs.map(mapDoctor);

  return (
    <DoctorsListClient
      initialData={initialData}
      initialTotal={total}
      user={user}
    />
  );
}
