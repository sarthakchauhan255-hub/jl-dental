import { clinicPublicSchema, type ClinicPublicContent } from "../schemas/clinic-public.schema";
import { clinicPublicFallback } from "../fallback-data/clinic-public.fallback";

export function mapClinicPublic(raw: unknown): ClinicPublicContent {
  if (!raw || typeof raw !== "object") return clinicPublicFallback;
  const result = clinicPublicSchema.safeParse(raw);
  return result.success ? result.data : clinicPublicFallback;
}
