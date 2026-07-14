import type { Metadata }       from "next";
import { notFound, redirect }  from "next/navigation";
import { getAuthUser }         from "@/lib/auth/session";
import { hasPermission }       from "@/lib/auth/rbac";
import { connectDB }           from "@/lib/db/connection";
import { Doctor }              from "@/models/Doctor";
import { ResourceEditPage }    from "@/components/cms/engine";
import { doctorConfig }        from "@/features/doctors/config/doctors.config";
import { doctorService }       from "@/features/doctors/service/doctors.service";
import { DoctorFormFields }    from "@/features/doctors/components/doctor-form-fields";
import { doctorUpdateSchema }   from "@/lib/validations";
import type { ZodSchema }        from "zod";
import type { DoctorInput }      from "@/features/doctors/service/doctors.service";
import type { DoctorRecord }   from "@/features/doctors/service/doctors.service";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Edit Doctor | Admin",
  robots: { index: false, follow: false },
};

export default async function EditDoctorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getAuthUser();
  if (!user || !hasPermission(user.role, "doctors.update")) redirect("/admin/doctors");

  const { id } = await params;
  await connectDB();
  const doc = await Doctor.findById(id).lean();
  if (!doc) notFound();

  const record: DoctorRecord = {
    id:             String(doc._id),
    name:           doc.name,
    slug:           doc.slug,
    specialization: doc.specialization,
    qualifications: doc.qualifications ?? [],
    bio:            doc.bio ?? "",
    order:          doc.order,
    isActive:       doc.isActive,
    photo:          doc.photo ?? null,
    seo:            doc.seo ?? {},
    createdAt:      doc.createdAt?.toISOString(),
    updatedAt:      doc.updatedAt?.toISOString(),
  };

  return (
    <ResourceEditPage
      config={doctorConfig}
      service={doctorService}
      schema={doctorUpdateSchema as unknown as ZodSchema<DoctorInput>}
      record={record}
      defaultValues={{
        name:           record.name,
        slug:           record.slug,
        specialization: record.specialization,
        qualifications: record.qualifications,
        bio:            record.bio,
        order:          record.order,
        isActive:       record.isActive,
        seo:            record.seo,
      }}
    >
      {handle => <DoctorFormFields handle={handle} isEdit />}
    </ResourceEditPage>
  );
}
