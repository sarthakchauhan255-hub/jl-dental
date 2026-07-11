import { ApiResourceService } from "@/lib/cms/contracts";
export type GalleryType = "before_after" | "general";
export interface GalleryRecord extends Record<string, unknown> {
  id: string; type: GalleryType; category: string;
  caption: string; order: number; isActive: boolean;
  before: { url: string; publicId: string } | null;
  after:  { url: string; publicId: string } | null;
  image:  { url: string; publicId: string } | null;
  createdAt?: string; updatedAt?: string;
}
export interface GalleryInput extends Record<string, unknown> {
  type: GalleryType; category?: string; caption?: string;
  order?: number; isActive?: boolean;
  before?: { url: string; publicId: string } | null;
  after?:  { url: string; publicId: string } | null;
  image?:  { url: string; publicId: string } | null;
}
export class GalleryService extends ApiResourceService<GalleryRecord, GalleryInput> {
  constructor() { super("/api/gallery"); }
}
export const galleryService = new GalleryService();
