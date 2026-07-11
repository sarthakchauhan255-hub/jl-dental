/**
 * LocalFallbackProvider — returns safe defaults.
 *
 * Used when: DB unavailable, no CMS configured, or as test double.
 * All content resolves gracefully — no empty renders, no crashes.
 */
import type { CmsProvider, ListOptions, HomepageSections } from "../contracts/cms-provider.contract";
import { fallbackClinic, fallbackHomepageSections, fallbackTestimonials } from "../fallback/fallback-data";
import type { TestimonialItem } from "@/features/homepage/components/testimonials-preview-section";
import type { DoctorContent }      from "@/features/doctors/schemas/doctor.schema";
import type { ServiceContent }     from "@/features/services/schemas/service.schema";
import type { GalleryItemContent } from "@/features/gallery/schemas/gallery-item.schema";
import type { BlogPostContent }    from "@/features/blog/schemas/blog-post.schema";
import type { FaqItemContent }     from "@/features/faq/schemas/faq-item.schema";
import type { ClinicPublicContent } from "@/features/clinic/schemas/clinic-public.schema";

export class LocalFallbackProvider implements CmsProvider {
  async getClinicConfig(): Promise<ClinicPublicContent>         { return fallbackClinic; }
  async getHomepageSections(): Promise<HomepageSections>        { return fallbackHomepageSections; }
  async getServices(_opts?: ListOptions): Promise<ServiceContent[]>       { return []; }
  async getServiceBySlug(_slug: string): Promise<ServiceContent | null>   { return null; }
  async getDoctors(_opts?: ListOptions): Promise<DoctorContent[]>         { return []; }
  async getDoctorBySlug(_slug: string): Promise<DoctorContent | null>     { return null; }
  async getGalleryItems(_opts?: ListOptions): Promise<GalleryItemContent[]>{ return []; }
  async getPublishedPosts(_opts?: ListOptions): Promise<BlogPostContent[]> { return []; }
  async getPostBySlug(_slug: string): Promise<BlogPostContent | null>     { return null; }
  async getFaqs(_opts?: ListOptions): Promise<FaqItemContent[]>           { return []; }
  async getApprovedTestimonials(_limit?: number): Promise<TestimonialItem[]> { return fallbackTestimonials; }
}
