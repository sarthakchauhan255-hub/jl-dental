import { getClinic } from "@/features/clinic/server/get-clinic";
import {
  mapHeroContent,
  mapServicesPreview,
  mapDoctorsPreview,
  mapTestimonialsPreview,
  mapCtaBlock,
  mapFaqPreview,
  mapGalleryPreview,
} from "../mappers";

/**
 * Server-only homepage content resolver.
 * Fetches the Clinic CMS document once, maps every section through its
 * own schema-validated mapper. Pages never see raw CMS shape.
 */
export async function getHomepageContent() {
  const clinic = await getClinic();
  const homepage = clinic?.homepage as Record<string, unknown> | undefined;

  return {
    hero:            mapHeroContent(homepage?.hero),
    servicesPreview: mapServicesPreview(homepage?.servicesPreview),
    doctorsPreview:  mapDoctorsPreview(homepage?.doctorsPreview),
    testimonials:    mapTestimonialsPreview(homepage?.testimonials),
    ctaBlock:        mapCtaBlock(homepage?.ctaBlock),
    faqPreview:      mapFaqPreview(homepage?.faqPreview),
    galleryPreview:  mapGalleryPreview(homepage?.galleryPreview),
  };
}
