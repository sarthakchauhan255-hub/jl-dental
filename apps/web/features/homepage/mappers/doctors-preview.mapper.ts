import { doctorsPreviewSchema, type DoctorsPreviewContent } from "../schemas/doctors-preview.schema";
import { doctorsPreviewFallback } from "../fallback-data/doctors-preview.fallback";

export function mapDoctorsPreview(raw: unknown): DoctorsPreviewContent {
  if (!raw || typeof raw !== "object") return doctorsPreviewFallback;
  const result = doctorsPreviewSchema.safeParse(raw);
  return result.success ? result.data : doctorsPreviewFallback;
}
