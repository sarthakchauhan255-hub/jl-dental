import { serviceSchema, serviceListSchema, type ServiceContent } from "../schemas/service.schema";
import { serviceListFallback } from "../fallback-data/service.fallback";

export function mapService(raw: unknown): ServiceContent | null {
  const result = serviceSchema.safeParse(raw);
  return result.success ? result.data : null;
}

export function mapServiceList(raw: unknown): ServiceContent[] {
  const result = serviceListSchema.safeParse(raw);
  return result.success ? result.data : serviceListFallback;
}
