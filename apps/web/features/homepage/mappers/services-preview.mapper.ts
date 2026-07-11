import { servicesPreviewSchema, type ServicesPreviewContent } from "../schemas/services-preview.schema";
import { servicesPreviewFallback } from "../fallback-data/services-preview.fallback";

export function mapServicesPreview(raw: unknown): ServicesPreviewContent {
  if (!raw || typeof raw !== "object") return servicesPreviewFallback;
  const result = servicesPreviewSchema.safeParse(raw);
  return result.success ? result.data : servicesPreviewFallback;
}
