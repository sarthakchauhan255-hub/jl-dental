import { doctorSchema, doctorListSchema, type DoctorContent } from "../schemas/doctor.schema";
import { doctorListFallback } from "../fallback-data/doctor.fallback";

export function mapDoctor(raw: unknown): DoctorContent | null {
  const result = doctorSchema.safeParse(raw);
  return result.success ? result.data : null;
}

export function mapDoctorList(raw: unknown): DoctorContent[] {
  const result = doctorListSchema.safeParse(raw);
  return result.success ? result.data : doctorListFallback;
}
