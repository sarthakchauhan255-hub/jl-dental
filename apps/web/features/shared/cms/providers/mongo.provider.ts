/**
 * MongoCmsProvider — connects to MongoDB via Mongoose and resolves CMS content.
 *
 * This is the production provider. All DB imports are confined here.
 * Pages must never import connectDB, Mongoose models, or any DB driver directly.
 *
 * Phase 5 status: skeleton — method bodies delegate to existing feature resolvers.
 * Phase 6 will consolidate full query logic here.
 */
import type { CmsProvider, ListOptions, HomepageSections } from "../contracts/cms-provider.contract";
import { fallbackClinic, fallbackHomepageSections } from "../fallback/fallback-data";
import type { TestimonialItem } from "@/features/homepage/components/testimonials-preview-section";
import type { DoctorContent }       from "@/features/doctors/schemas/doctor.schema";
import type { ServiceContent }      from "@/features/services/schemas/service.schema";
import type { GalleryItemContent }  from "@/features/gallery/schemas/gallery-item.schema";
import type { BlogPostContent }     from "@/features/blog/schemas/blog-post.schema";
import type { FaqItemContent }      from "@/features/faq/schemas/faq-item.schema";
import type { ClinicPublicContent } from "@/features/clinic/schemas/clinic-public.schema";

export class MongoCmsProvider implements CmsProvider {
  async getClinicConfig(): Promise<ClinicPublicContent> {
    try {
      const { getClinic }       = await import("@/features/clinic/server/get-clinic");
      const { mapClinicPublic } = await import("@/features/clinic/mappers");
      const doc = await getClinic();
      return mapClinicPublic(doc ? JSON.parse(JSON.stringify(doc)) : null);
    } catch { return fallbackClinic; }
  }

  async getHomepageSections(): Promise<HomepageSections> {
    try {
      const { getClinic } = await import("@/features/clinic/server/get-clinic");
      const doc = await getClinic();
      const hp  = (doc?.homepage ?? {}) as Record<string, unknown>;
      return {
        hero:            hp.hero            ?? fallbackHomepageSections.hero,
        servicesPreview: hp.servicesPreview ?? fallbackHomepageSections.servicesPreview,
        doctorsPreview:  hp.doctorsPreview  ?? fallbackHomepageSections.doctorsPreview,
        testimonials:    hp.testimonials    ?? fallbackHomepageSections.testimonials,
        ctaBlock:        hp.ctaBlock        ?? fallbackHomepageSections.ctaBlock,
        faqPreview:      hp.faqPreview      ?? fallbackHomepageSections.faqPreview,
        galleryPreview:  hp.galleryPreview  ?? fallbackHomepageSections.galleryPreview,
      };
    } catch { return fallbackHomepageSections; }
  }

  async getServices(opts?: ListOptions): Promise<ServiceContent[]> {
    try {
      const { getActiveServices } = await import("@/features/services/server/get-services");
      const all = await getActiveServices();
      return opts?.limit ? all.slice(0, opts.limit) : all;
    } catch { return []; }
  }

  async getServiceBySlug(slug: string): Promise<ServiceContent | null> {
    try {
      const { getServiceBySlug } = await import("@/features/services/server/get-services");
      return getServiceBySlug(slug);
    } catch { return null; }
  }

  async getDoctors(opts?: ListOptions): Promise<DoctorContent[]> {
    try {
      const { getActiveDoctors } = await import("@/features/doctors/server/get-doctors");
      const all = await getActiveDoctors();
      return opts?.limit ? all.slice(0, opts.limit) : all;
    } catch { return []; }
  }

  async getDoctorBySlug(slug: string): Promise<DoctorContent | null> {
    try {
      const { getDoctorBySlug } = await import("@/features/doctors/server/get-doctors");
      return getDoctorBySlug(slug);
    } catch { return null; }
  }

  async getGalleryItems(opts?: ListOptions): Promise<GalleryItemContent[]> {
    try {
      const { getGalleryItems } = await import("@/features/gallery/server/get-gallery");
      const all = await getGalleryItems();
      return opts?.limit ? all.slice(0, opts.limit) : all;
    } catch { return []; }
  }

  async getPublishedPosts(opts?: ListOptions): Promise<BlogPostContent[]> {
    try {
      const { getPublishedPosts } = await import("@/features/blog/server/get-blog-posts");
      const all = await getPublishedPosts();
      return opts?.limit ? all.slice(0, opts.limit) : all;
    } catch { return []; }
  }

  async getPostBySlug(slug: string): Promise<BlogPostContent | null> {
    try {
      const { getPostBySlug } = await import("@/features/blog/server/get-blog-posts");
      return getPostBySlug(slug);
    } catch { return null; }
  }

  async getFaqs(opts?: ListOptions): Promise<FaqItemContent[]> {
    try {
      const { getActiveFaqs } = await import("@/features/faq/server/get-faqs");
      const all = await getActiveFaqs();
      return opts?.limit ? all.slice(0, opts.limit) : all;
    } catch { return []; }
  }

  async getApprovedTestimonials(_limit = 6): Promise<TestimonialItem[]> {
    // Phase 6: query Review collection for approved reviews
    // Review CRUD not yet implemented — returns empty (correct spec behavior)
    return [];
  }
}
