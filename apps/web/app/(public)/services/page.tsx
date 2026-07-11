import type { Metadata } from "next";
import Link from "next/link";
import { Stethoscope, ArrowRight } from "lucide-react";
import { Section, SectionHeader } from "@/components/common/section";
import { Reveal, StaggerReveal }  from "@/components/common/motion";
import { OptimizedImage }         from "@/components/common/optimized-image";
import { EmptyState }             from "@/components/states";
import { serviceCoverUrl }        from "@/lib/media/cloudinary-url";
import { getCmsProvider }          from "@/features/shared/cms";
import { resolveMetadata }        from "@/lib/seo";
import { REVALIDATE }             from "@/lib/cache";

export const revalidate = REVALIDATE.services;

export async function generateMetadata(): Promise<Metadata> {
  return resolveMetadata({
    path: "/services",
    entityTitle: "Our Services",
    entityDesc:  "Comprehensive dental care in Solan — from preventive checkups to cosmetic dentistry.",
  });
}

export default async function ServicesPage() {
  const cms = getCmsProvider();
  const services = await cms.getServices();

  return (
    <Section bg="white" size="lg">
      <SectionHeader
        label="What We Offer"
        heading="Our Services"
        subtext="Comprehensive dental care, delivered with precision and compassion."
        align="left"
      />

      {services.length === 0 ? (
        <EmptyState
          icon={Stethoscope}
          heading="Services coming soon"
          description="We're putting together our full list of treatments. Please check back shortly, or contact us directly."
          action={{ label: "Contact Us", href: "/contact" }}
        />
      ) : (
        <StaggerReveal className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <Reveal key={service.id} variant="fadeUp">
              <Link
                href={`/services/${service.slug}`}
                className="group block card-base overflow-hidden h-full hover:shadow-md hover:-translate-y-0.5 transition-all duration-300"
              >
                {service.coverImage?.publicId ? (
                  <div className="relative aspect-video overflow-hidden">
                    <OptimizedImage
                      src={serviceCoverUrl(service.coverImage.publicId)}
                      alt={service.name}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="group-hover:scale-105 transition-transform duration-400"
                    />
                  </div>
                ) : (
                  <div className="flex aspect-video items-center justify-center bg-primary-50">
                    <Stethoscope className="h-10 w-10 text-primary-300" aria-hidden="true" />
                  </div>
                )}
                <div className="p-6">
                  <h2 className="heading-4 mb-2">{service.name}</h2>
                  <p className="body-sm text-muted-foreground mb-4 line-clamp-2">{service.shortDesc}</p>
                  <span className="inline-flex items-center gap-1.5 text-sm font-medium text-primary-700">
                    Learn more <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                  </span>
                </div>
              </Link>
            </Reveal>
          ))}
        </StaggerReveal>
      )}
    </Section>
  );
}
