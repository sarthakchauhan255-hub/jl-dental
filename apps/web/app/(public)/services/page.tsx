import type { Metadata } from "next";
import { Stethoscope } from "lucide-react";
import { Section } from "@/components/common/section";
import { EmptyState }             from "@/components/states";
import { ServicesScrollList }     from "@/features/services/components/services-scroll-list";
import { getCmsProvider }         from "@/features/shared/cms";
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
    <>
      {/* Petrol hero */}
      <section className="bg-primary-900 text-white">
        <div className="container-base py-20 md:py-28 lg:py-32">
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-[hsl(var(--accent-cyan))]">
            What We Offer
          </p>
          <h1 className="heading-1 max-w-3xl text-white">Our Services</h1>
          <p className="body-lg mt-5 max-w-xl text-white/70">
            Comprehensive dental care, delivered with precision and compassion.
          </p>
        </div>
      </section>

      <Section bg="muted" size="lg">
        {services.length === 0 ? (
          <EmptyState
            icon={Stethoscope}
            heading="Services coming soon"
            description="We're putting together our full list of treatments. Please check back shortly, or contact us directly."
            action={{ label: "Contact Us", href: "/contact" }}
          />
        ) : (
          <ServicesScrollList services={services} />
        )}
      </Section>
    </>
  );
}
