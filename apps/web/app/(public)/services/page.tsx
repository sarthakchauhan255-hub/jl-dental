import type { Metadata } from "next";
import { Stethoscope } from "lucide-react";
import { Section, SectionHeader } from "@/components/common/section";
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
    <Section bg="muted" size="lg">
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
        <ServicesScrollList services={services} />
      )}
    </Section>
  );
}
