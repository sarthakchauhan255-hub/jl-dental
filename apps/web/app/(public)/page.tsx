import type { Metadata } from "next";
import { getCmsProvider }        from "@/features/shared/cms";
import {
  mapHeroContent,
  mapServicesPreview,
  mapDoctorsPreview,
  mapTestimonialsPreview,
  mapCtaBlock,
  mapFaqPreview,
  mapGalleryPreview,
} from "@/features/homepage/mappers";
import { resolveMetadata, buildDentistSchema } from "@/lib/seo";
import { REVALIDATE }            from "@/lib/cache";
import { env }                   from "@/env";

import { HeroSection }               from "@/features/homepage/components/hero-section";
import { ServicesPreviewSection }    from "@/features/homepage/components/services-preview-section";
import { DoctorsPreviewSection }     from "@/features/homepage/components/doctors-preview-section";
import { TestimonialsPreviewSection } from "@/features/homepage/components/testimonials-preview-section";
import { GalleryPreviewSection }     from "@/features/homepage/components/gallery-preview-section";
import { FaqPreviewSection }         from "@/features/homepage/components/faq-preview-section";
import { CtaBlockSection }           from "@/features/homepage/components/cta-block-section";
import { ContactStripSection }       from "@/features/homepage/components/contact-strip-section";
import { GoogleTestimonialsSection } from "@/features/homepage/components/google-testimonials-section";

export const revalidate = REVALIDATE.homepage;

export async function generateMetadata(): Promise<Metadata> {
  const cms    = getCmsProvider();
  const clinic = await cms.getClinicConfig();
  return resolveMetadata({ path: "/", entityTitle: clinic.name });
}

export default async function HomePage() {
  const cms = getCmsProvider();

  const [sections, services, doctors, gallery, faqs, testimonials, clinic] = await Promise.all([
    cms.getHomepageSections(),
    cms.getServices({ limit: 6 }),
    cms.getDoctors(),
    cms.getGalleryItems({ limit: 3 }),
    cms.getFaqs({ limit: 5 }),
    cms.getApprovedTestimonials(6),
    cms.getClinicConfig(),
  ]);

  const schema = buildDentistSchema({
    name:    clinic.name,
    url:     env.NEXT_PUBLIC_APP_URL,
    phone:   clinic.contact.phone,
    email:   clinic.contact.email,
    address: clinic.contact.address,
    city:    "Solan",
    state:   "Himachal Pradesh",
    lat:     clinic.location?.latitude,
    lng:     clinic.location?.longitude,
    social:  clinic.social,
  });

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: schema }} />
      <HeroSection           content={mapHeroContent(sections.hero)} />
      <ServicesPreviewSection content={mapServicesPreview(sections.servicesPreview)} services={services} />
      <DoctorsPreviewSection  content={mapDoctorsPreview(sections.doctorsPreview)} doctors={doctors} />
      <GalleryPreviewSection  content={mapGalleryPreview(sections.galleryPreview)} items={gallery} />
      <TestimonialsPreviewSection content={mapTestimonialsPreview(sections.testimonials)} testimonials={testimonials} />
      <FaqPreviewSection      content={mapFaqPreview(sections.faqPreview)} faqs={faqs} />
      <CtaBlockSection        content={mapCtaBlock(sections.ctaBlock)} />
      <ContactStripSection    clinic={clinic} />
      <GoogleTestimonialsSection />
      
    </>
  );
}
