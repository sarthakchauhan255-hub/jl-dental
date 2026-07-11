import { ApiResourceService } from "@/lib/cms/contracts";
export interface ServiceRecord extends Record<string, unknown> {
  id: string; name: string; slug: string; shortDesc: string;
  fullContent: string; icon: string; order: number;
  isActive: boolean; isFeatured: boolean;
  coverImage: { url: string; publicId: string } | null;
  seo: { title?: string; description?: string };
  createdAt?: string; updatedAt?: string;
}
export interface ServiceInput extends Record<string, unknown> {
  name: string; slug: string; shortDesc: string; fullContent?: string;
  icon?: string; order?: number; isActive?: boolean; isFeatured?: boolean;
  coverImage?: { url: string; publicId: string } | null;
  seo?: { title?: string; description?: string };
}
export class ServiceService extends ApiResourceService<ServiceRecord, ServiceInput> {
  constructor() { super("/api/services"); }
}
export const serviceService = new ServiceService();
