import { ApiResourceService } from "@/lib/cms/contracts";
export interface ClinicRecord extends Record<string, unknown> {
  id: string; name: string; tagline?: string; description?: string;
  contact?: Record<string, string>;
  social?: Record<string, string>;
  seo?: { defaultTitle?: string; defaultDescription?: string };
  logo?: { url: string; publicId: string; alt?: string } | null;
  updatedAt?: string;
}
export interface ClinicInput extends Record<string, unknown> {
  name?: string; tagline?: string; description?: string;
  contact?: Record<string, string>;
  social?: Record<string, string>;
  seo?: { defaultTitle?: string; defaultDescription?: string };
  logo?: { url: string; publicId: string; alt?: string } | null;
}
export class ClinicAdminService extends ApiResourceService<ClinicRecord, ClinicInput> {
  constructor() { super("/api/clinic"); }
  async getCurrent(): Promise<ClinicRecord | null> {
    try {
      const res = await fetch(this.apiPath, { cache: "no-store" });
      if (!res.ok) return null;
      const json = await res.json() as { success: boolean; data: ClinicRecord | null };
      return json.data;
    } catch { return null; }
  }
}
export const clinicAdminService = new ClinicAdminService();
