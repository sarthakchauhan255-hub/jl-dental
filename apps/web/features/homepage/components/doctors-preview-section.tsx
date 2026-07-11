import Link from "next/link";
import { UserRound, ArrowRight } from "lucide-react";
import { Section, SectionHeader } from "@/components/common/section";
import { OptimizedImage }         from "@/components/common/optimized-image";
import { EmptyState }             from "@/components/states";
import { doctorPhotoUrl }         from "@/lib/media/cloudinary-url";
import type { DoctorsPreviewContent } from "../schemas/doctors-preview.schema";
import type { DoctorContent }     from "@/features/doctors/schemas/doctor.schema";

export function DoctorsPreviewSection({
  content, doctors,
}: { content: DoctorsPreviewContent; doctors: DoctorContent[] }) {
  if (!content.enabled) return null;

  return (
    <Section bg="muted">
      <SectionHeader label="Our Team" heading={content.title} subtext={content.subtitle} />

      {doctors.length === 0 ? (
        <EmptyState
          icon={UserRound}
          heading="Meet our team soon"
          description="Doctor profiles are being added. Check back shortly."
        />
      ) : (
        <>
          {/* Desktop: grid */}
          <div className="hidden md:grid grid-cols-2 lg:grid-cols-3 gap-6">
            {doctors.slice(0, 6).map((doctor) => (
              <div key={doctor.id}>
                <DoctorCard doctor={doctor} />
              </div>
            ))}
          </div>

          {/* Mobile: horizontal swipe carousel */}
          <div className="md:hidden -mx-4 px-4 flex gap-4 overflow-x-auto snap-x snap-mandatory pb-2">
            {doctors.slice(0, 6).map((doctor) => (
              <div key={doctor.id} className="snap-start shrink-0 w-[78%]">
                <DoctorCard doctor={doctor} />
              </div>
            ))}
          </div>
        </>
      )}

      {doctors.length > 0 && (
        <div className="mt-10 text-center">
          <Link href="/doctors" className="inline-flex items-center gap-1.5 text-sm font-medium text-primary-700 hover:text-primary-800">
            Meet all doctors <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      )}
    </Section>
  );
}

function DoctorCard({ doctor }: { doctor: DoctorContent }) {
  return (
    <Link href={`/doctors/${doctor.slug}`} className="group block card-base overflow-hidden hover:shadow-md transition-shadow duration-300">
      {doctor.photo?.publicId ? (
        <div className="relative aspect-[3/4] overflow-hidden">
          <OptimizedImage
            src={doctorPhotoUrl(doctor.photo.publicId)}
            alt={`Dr. ${doctor.name}, ${doctor.specialization}`}
            fill
            sizes="(max-width: 768px) 78vw, (max-width: 1024px) 50vw, 33vw"
            className="group-hover:scale-105 transition-transform duration-400"
          />
        </div>
      ) : (
        <div className="flex aspect-[3/4] items-center justify-center bg-primary-50">
          <UserRound className="h-12 w-12 text-primary-300" aria-hidden="true" />
        </div>
      )}
      <div className="p-5">
        <h3 className="heading-4 mb-1">Dr. {doctor.name}</h3>
        <p className="body-sm text-primary-600 font-medium">{doctor.specialization}</p>
      </div>
    </Link>
  );
}
