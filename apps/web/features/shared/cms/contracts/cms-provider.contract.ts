/**
 * CmsProvider contract — the only interface public pages talk to.
 *
 * Architecture rule:
 *   page → CmsProvider → mapper → schema → component
 *
 * Pages never import connectDB, Mongoose models, or any DB driver.
 * The provider implementation is injected at the server boundary.
 * Swapping from MongoDB to a headless CMS requires only a new provider.
 */
import type { DoctorContent }       from "@/features/doctors/schemas/doctor.schema";
import type { ServiceContent }      from "@/features/services/schemas/service.schema";
import type { GalleryItemContent }  from "@/features/gallery/schemas/gallery-item.schema";
import type { BlogPostContent }     from "@/features/blog/schemas/blog-post.schema";
import type { FaqItemContent }      from "@/features/faq/schemas/faq-item.schema";
import type { ClinicPublicContent } from "@/features/clinic/schemas/clinic-public.schema";
import type { TestimonialItem }     from "@/features/homepage/components/testimonials-preview-section";

export interface CmsProvider {
  // ─── Clinic ──────────────────────────────────────────────────────────────
  getClinicConfig():         Promise<ClinicPublicContent>;
  getHomepageSections():     Promise<HomepageSections>;

  // ─── Content collections ─────────────────────────────────────────────────
  getServices(opts?: ListOptions):          Promise<ServiceContent[]>;
  getServiceBySlug(slug: string):           Promise<ServiceContent | null>;
  getDoctors(opts?: ListOptions):           Promise<DoctorContent[]>;
  getDoctorBySlug(slug: string):            Promise<DoctorContent | null>;
  getGalleryItems(opts?: ListOptions):      Promise<GalleryItemContent[]>;
  getPublishedPosts(opts?: ListOptions):    Promise<BlogPostContent[]>;
  getPostBySlug(slug: string):              Promise<BlogPostContent | null>;
  getFaqs(opts?: ListOptions):              Promise<FaqItemContent[]>;
  getApprovedTestimonials(limit?: number):  Promise<TestimonialItem[]>;
}

export interface ListOptions {
  limit?: number;
  page?:  number;
}

/**
 * The resolved content for all seven homepage sections.
 * Returned as a single call to allow batched/cached DB fetch in providers.
 */
export interface HomepageSections {
  hero:            unknown;
  servicesPreview: unknown;
  doctorsPreview:  unknown;
  testimonials:    unknown;
  ctaBlock:        unknown;
  faqPreview:      unknown;
  galleryPreview:  unknown;
}
