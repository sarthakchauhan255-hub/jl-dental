import Link from "next/link";
import { Stethoscope, ArrowRight } from "lucide-react";
import { Section, SectionHeader } from "@/components/common/section";
import { OptimizedImage }         from "@/components/common/optimized-image";
import { EmptyState }             from "@/components/states";
import { serviceCoverUrl }        from "@/lib/media/cloudinary-url";
import type { ServicesPreviewContent } from "../schemas/services-preview.schema";
import type { ServiceContent }    from "@/features/services/schemas/service.schema";

export function ServicesPreviewSection({
  content, services,
}: { content: ServicesPreviewContent; services: ServiceContent[] }) {
  if (!content.enabled) return null;

  const items = services.slice(0, content.maxDisplay);

  return (
    <Section bg="white">
      <SectionHeader label="Our Services" heading={content.title} subtext={content.subtitle} />

      {items.length === 0 ? (
        <EmptyState
          icon={Stethoscope}
          heading="Services coming soon"
          description="We're putting together our full list of treatments. Check back shortly."
        />
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {items.map((service) => (
            <div key={service.id}>
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
                  <h3 className="heading-4 mb-2">{service.name}</h3>
                  <p className="body-sm text-muted-foreground mb-4 line-clamp-2">{service.shortDesc}</p>
                  <span className="inline-flex items-center gap-1.5 text-sm font-medium text-primary-700">
                    Learn more <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                  </span>
                </div>
              </Link>
            </div>
          ))}
        </div>
      )}

      {items.length > 0 && (
        <div className="mt-12 text-center">
          <Link href="/services" className="inline-flex items-center gap-1.5 text-sm font-medium text-primary-700 hover:text-primary-800">
            View all services <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      )}
    </Section>
  );
}
