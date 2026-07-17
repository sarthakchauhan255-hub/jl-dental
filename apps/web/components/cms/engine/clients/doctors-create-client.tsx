"use client";
/**
 * DoctorCreateClient — client boundary for the doctors "new" page.
 * config/service/schema/form-fields all contain functions, which cannot be
 * passed from a Server Component. They are imported here on the client instead.
 */
import { ResourceCreatePage } from "@/components/cms/engine";
import { doctorConfig } from "@/features/doctors/config/doctors.config";
import { doctorService } from "@/features/doctors/service/doctors.service";
import { DoctorFormFields } from "@/features/doctors/components/doctor-form-fields";
import { doctorCreateSchema } from "@/lib/validations";
import type { ZodSchema } from "zod";
import type { DoctorInput } from "@/features/doctors/service/doctors.service";

export function DoctorCreateClient() {
  return (
    <ResourceCreatePage
      config={doctorConfig}
      service={doctorService}
      schema={doctorCreateSchema as unknown as ZodSchema<DoctorInput>}
    >
      {handle => <DoctorFormFields handle={handle} />}
    </ResourceCreatePage>
  );
}
