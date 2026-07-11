import type { Metadata } from "next";
import Link from "next/link";
import { UserRound } from "lucide-react";
import { Section, SectionHeader } from "@/components/common/section";
import { Reveal, StaggerReveal }  from "@/components/common/motion";
import { OptimizedImage }         from "@/components/common/optimized-image";
import { EmptyState }             from "@/components/states";
import { doctorPhotoUrl }         from "@/lib/media/cloudinary-url";
import { getCmsProvider }          from "@/features/shared/cms";
import { resolveMetadata }        from "@/lib/seo";
import { REVALIDATE }             from "@/lib/cache";
import { BRAND } from "@/config/branding";

export const revalidate = REVALIDATE.doctors;

export async function generateMetadata(): Promise<Metadata> {
  return resolveMetadata({
    path: "/doctors",
    entityTitle: "Our Doctors",
    entityDesc:  `Meet the experienced dental specialists at ${BRAND.NAME}, ${BRAND.CITY}.`,
  });
}

export default async function DoctorsPage() {
  const cms = getCmsProvider();
  const doctors = await cms.getDoctors();

  return (
    <Section bg="white" size="lg">
      <SectionHeader
        label="Our Team"
        heading="Meet Our Doctors"
        subtext="Experienced specialists dedicated to your dental health and comfort."
        align="left"
      />

      {doctors.length === 0 ? (
        <EmptyState
          icon={UserRound}
          heading="Doctor profiles coming soon"
          description="We're adding our team's profiles. Please check back shortly."
          action={{ label: "Contact Us", href: "/contact" }}
        />
      ) : (
        <StaggerReveal className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {doctors.map((doctor) => (
            <Reveal key={doctor.id} variant="fadeUp">
              <Link href={`/doctors/${doctor.slug}`} className="group block card-base overflow-hidden hover:shadow-md transition-shadow duration-300">
                {doctor.photo?.publicId ? (
                  <div className="relative aspect-[3/4] overflow-hidden">
                    <OptimizedImage
                      src={doctorPhotoUrl(doctor.photo.publicId)}
                      alt={`Dr. ${doctor.name}, ${doctor.specialization}`}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="group-hover:scale-105 transition-transform duration-400"
                    />
                  </div>
                ) : (
                  <div className="flex aspect-[3/4] items-center justify-center bg-primary-50">
                    <UserRound className="h-12 w-12 text-primary-300" aria-hidden="true" />
                  </div>
                )}
                <div className="p-5">
                  <h2 className="heading-4 mb-1">Dr. {doctor.name}</h2>
                  <p className="body-sm text-primary-600 font-medium mb-2">{doctor.specialization}</p>
                  {doctor.bio && <p className="body-sm text-muted-foreground line-clamp-2">{doctor.bio}</p>}
                </div>
              </Link>
            </Reveal>
          ))}
        </StaggerReveal>
      )}
    </Section>
  );
}
