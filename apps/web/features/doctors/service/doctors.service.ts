/**
 * DoctorService — resource service for the CMS engine.
 *
 * Extends ApiResourceService with Doctor-specific:
 * - typed record/input shapes
 * - resource-owned lifecycle patches (activate/deactivate semantics defined here)
 *
 * Used by: admin CMS pages, CmsTable, ResourceListPage
 * NOT used by: public pages (those use CmsProvider → MongoCmsProvider)
 */
import { ApiResourceService } from "@/lib/cms/contracts";
import type { CmsMutationResult } from "@/lib/cms/types";

export interface DoctorRecord extends Record<string, unknown> {
  id:             string;
  name:           string;
  slug:           string;
  specialization: string;
  qualifications: string[];
  bio:            string;
  order:          number;
  isActive:       boolean;
  photo:          { url: string; publicId: string; alt?: string } | null;
  seo:            { title?: string; description?: string };
  createdAt?:     string;
  updatedAt?:     string;
}

export interface DoctorInput extends Record<string, unknown> {
  name:           string;
  slug:           string;
  specialization: string;
  qualifications?: string[];
  bio?:            string;
  order?:          number;
  isActive?:       boolean;
  photo?:          { url: string; publicId: string } | null;
  seo?:            { title?: string; description?: string };
}

export class DoctorService extends ApiResourceService<DoctorRecord, DoctorInput> {
  constructor() { super("/api/doctors"); }

  /** Activate — sets isActive: true. Resource defines semantics, engine doesn't. */
  async activate(id: string): Promise<CmsMutationResult<DoctorRecord>> {
    return this.update(id, { isActive: true });
  }

  /** Deactivate — sets isActive: false. */
  async deactivate(id: string): Promise<CmsMutationResult<DoctorRecord>> {
    return this.update(id, { isActive: false });
  }
}

// Singleton service instance for use in admin pages and CMS config
export const doctorService = new DoctorService();
