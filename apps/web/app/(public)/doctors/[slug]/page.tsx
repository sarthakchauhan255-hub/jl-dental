import type { Metadata } from "next";
import { notFound }      from "next/navigation";
import Link               from "next/link";
import { UserRound }      from "lucide-react";
import { OptimizedImage } from "@/components/common/optimized-image";
import { Reveal }         from "@/components/common/motion";
import { doctorPhotoUrl } from "@/lib/media/cloudinary-url";
import { getCmsProvider } from "@/features/shared/cms";
import { resolveMetadata, buildJsonLd } from "@/lib/seo";
import { REVALIDATE }     from "@/lib/cache";
import { BRAND } from "@/config/branding";

export const revalidate = REVALIDATE.doctors;

interface PageProps { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const cms = getCmsProvider();
  const doctor = await cms.getDoctorBySlug(slug);
  if (!doctor) return resolveMetadata({ path: `/doctors/${slug}`, pageSeo: { noIndex: true } });

  return resolveMetadata({
    path: `/doctors/${slug}`,
    entityTitle: `Dr. ${doctor.name} — ${doctor.specialization}`,
    entityDesc:  doctor.bio.slice(0, 155) || `${doctor.specialization} at ${BRAND.NAME}, ${BRAND.CITY}.`,
    entityImage: doctor.photo,
  });
}

export default async function DoctorDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const cms = getCmsProvider();
  const doctor = await cms.getDoctorBySlug(slug);

  if (!doctor) notFound();

  const schema = buildJsonLd({
    "@type":           "Physician",
    name:               `Dr. ${doctor.name}`,
    medicalSpecialty:   doctor.specialization,
    description:        doctor.bio,
  });

  return (
    <article className="container-base py-16">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: schema }} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <Reveal variant="fadeUp" className="lg:col-span-1">
          {doctor.photo?.publicId ? (
            <div className="relative aspect-[3/4] rounded-2xl overflow-hidden">
              <OptimizedImage
                src={doctorPhotoUrl(doctor.photo.publicId, 600)}
                alt={`Dr. ${doctor.name}`}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 33vw"
              />
            </div>
          ) : (
            <div className="flex aspect-[3/4] items-center justify-center rounded-2xl bg-primary-50">
              <UserRound className="h-16 w-16 text-primary-300" aria-hidden="true" />
            </div>
          )}
        </Reveal>

        <Reveal variant="fadeUp" delay={0.1} className="lg:col-span-2">
          <h1 className="heading-1 mb-2 balance">Dr. {doctor.name}</h1>
          <p className="text-lg text-primary-600 font-medium mb-6">{doctor.specialization}</p>

          {doctor.qualifications.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-8">
              {doctor.qualifications.map((q) => (
                <span key={q} className="rounded-full bg-primary-50 px-3 py-1 text-xs font-medium text-primary-700">
                  {q}
                </span>
              ))}
            </div>
          )}

          {doctor.bio && (
            <p className="body-base text-charcoal-700 leading-relaxed whitespace-pre-line mb-10">{doctor.bio}</p>
          )}

          <Link
            href="/book"
            className="inline-flex items-center justify-center rounded-lg bg-primary-700 px-7 py-3.5 text-sm font-medium text-white hover:bg-primary-800 transition-colors"
          >
            Book Consultation with Dr. {doctor.name}
          </Link>
        </Reveal>
      </div>
    </article>
  );
}

export async function generateStaticParams() {
  const { getActiveDoctors } = await import('@/features/doctors/server/get-doctors');
  const doctors = await getActiveDoctors();
  return doctors.map((d) => ({ slug: d.slug }));
}
