import type { Metadata } from "next";
import { UserRound } from "lucide-react";
import { Section }        from "@/components/common/section";
import { EmptyState }     from "@/components/states";
import { DoctorSpotlights } from "@/features/doctors/components/doctor-spotlights";
import { getCmsProvider } from "@/features/shared/cms";
import { resolveMetadata } from "@/lib/seo";
import { REVALIDATE }     from "@/lib/cache";
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
    <>
      {/* Petrol hero header */}
      <section className="bg-primary-900 text-white">
        <div className="container-base py-20 md:py-28 lg:py-32">
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-[hsl(var(--accent-cyan))]">
            Our Team
          </p>
          <h1 className="heading-1 max-w-3xl text-white">Meet Our Doctors</h1>
          <p className="body-lg mt-5 max-w-xl text-white/70">
            Experienced specialists dedicated to your dental health and comfort.
          </p>
        </div>
      </section>

      <Section bg="muted" size="lg">
        {doctors.length === 0 ? (
          <EmptyState
            icon={UserRound}
            heading="Doctor profiles coming soon"
            description="We're adding our team's profiles. Please check back shortly."
            action={{ label: "Contact Us", href: "/contact" }}
          />
        ) : (
          <DoctorSpotlights doctors={doctors} />
        )}
      </Section>
    </>
  );
}
