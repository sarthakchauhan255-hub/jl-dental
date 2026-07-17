"use client";
/**
 * DoctorEditClient — client boundary for the doctors edit page.
 * Receives ONLY serializable data (record, defaultValues); imports the
 * function-carrying config/service/schema/form-fields itself.
 */
import { ResourceEditPage } from "@/components/cms/engine";
import { doctorConfig } from "@/features/doctors/config/doctors.config";
import { doctorService } from "@/features/doctors/service/doctors.service";
import { DoctorFormFields } from "@/features/doctors/components/doctor-form-fields";
import { doctorUpdateSchema } from "@/lib/validations";
import type { ZodSchema } from "zod";
import type { DoctorRecord, DoctorInput } from "@/features/doctors/service/doctors.service";

export function DoctorEditClient({
  record, defaultValues,
}: {
  record: DoctorRecord;
  defaultValues: Partial<DoctorInput>;
}) {
  return (
    <ResourceEditPage
      config={doctorConfig}
      service={doctorService}
      schema={doctorUpdateSchema as unknown as ZodSchema<DoctorInput>}
      record={record}
      defaultValues={defaultValues}
    >
      {handle => <DoctorFormFields handle={handle} isEdit />}
    </ResourceEditPage>
  );
}
