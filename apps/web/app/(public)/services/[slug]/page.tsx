import type { Metadata } from "next";
import { notFound }      from "next/navigation";
import Link               from "next/link";
import { Stethoscope }    from "lucide-react";
import { OptimizedImage } from "@/components/common/optimized-image";
import { Reveal }         from "@/components/common/motion";
import { serviceCoverUrl } from "@/lib/media/cloudinary-url";
import { getCmsProvider } from "@/features/shared/cms";
import { resolveMetadata, buildJsonLd } from "@/lib/seo";
import { REVALIDATE }     from "@/lib/cache";

export const revalidate = REVALIDATE.services;

interface PageProps { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const cms = getCmsProvider();
  const service = await cms.getServiceBySlug(slug);
  if (!service) return resolveMetadata({ path: `/services/${slug}`, pageSeo: { noIndex: true } });

  return resolveMetadata({
    path: `/services/${slug}`,
    entityTitle: service.name,
    entityDesc:  service.shortDesc,
    entityImage: service.coverImage,
  });
}

export default async function ServiceDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const cms = getCmsProvider();
  const service = await cms.getServiceBySlug(slug);

  if (!service) notFound();

  const schema = buildJsonLd({
    "@type":      "MedicalProcedure",
    name:          service.name,
    description:   service.shortDesc,
  });

  return (
    <article>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: schema }} />

      {service.coverImage?.publicId ? (
        <div className="relative h-72 lg:h-96 w-full overflow-hidden">
          <OptimizedImage
            src={serviceCoverUrl(service.coverImage.publicId, 1600)}
            alt={service.name}
            fill
            priority
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-charcoal-900/70 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 container-base pb-10">
            <h1 className="heading-1 text-white balance">{service.name}</h1>
          </div>
        </div>
      ) : (
        <div className="bg-primary-50 py-16">
          <div className="container-base">
            <Stethoscope className="h-10 w-10 text-primary-400 mb-4" aria-hidden="true" />
            <h1 className="heading-1 balance">{service.name}</h1>
          </div>
        </div>
      )}

      <div className="container-narrow py-16">
        <Reveal variant="fadeUp">
          <p className="body-lg text-charcoal-600 mb-8">{service.shortDesc}</p>
          {service.fullContent && (
            <div className="prose prose-charcoal max-w-none body-base text-charcoal-700 leading-relaxed whitespace-pre-line">
              {service.fullContent}
            </div>
          )}
        </Reveal>

        <div className="mt-12 rounded-2xl bg-primary-50 p-8 text-center">
          <h2 className="heading-3 mb-3">Interested in {service.name}?</h2>
          <p className="body-base text-muted-foreground mb-6">Book a consultation with our team today.</p>
          <Link
            href="/book"
            className="inline-flex items-center justify-center rounded-lg bg-primary-700 px-7 py-3 text-sm font-medium text-white hover:bg-primary-800 transition-colors"
          >
            Book This Service
          </Link>
        </div>
      </div>
    </article>
  );
}

export async function generateStaticParams() {
  const { getActiveServices } = await import('@/features/services/server/get-services');
  const services = await getActiveServices();
  return services.map((s) => ({ slug: s.slug }));
}
