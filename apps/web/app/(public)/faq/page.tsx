import type { Metadata } from "next";
import { HelpCircle } from "lucide-react";
import { Section, SectionHeader } from "@/components/common/section";
import { EmptyState }    from "@/components/states";
import { FaqAccordion }  from "@/features/faq/components/faq-accordion";
import { getCmsProvider }  from "@/features/shared/cms";
import { resolveMetadata, buildJsonLd } from "@/lib/seo";
import { REVALIDATE }    from "@/lib/cache";
import { BRAND } from "@/config/branding";

export const revalidate = REVALIDATE.faq;

export async function generateMetadata(): Promise<Metadata> {
  return resolveMetadata({
    path: "/faq",
    entityTitle: "Frequently Asked Questions",
    entityDesc:  `Answers to common questions about treatments, appointments, and visiting ${BRAND.NAME}.`,
  });
}

export default async function FaqPage() {
  const cms = getCmsProvider();
  const faqs = await cms.getFaqs();

  const schema = faqs.length > 0 ? buildJsonLd({
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer },
    })),
  }) : "";

  return (
    <Section bg="muted" size="lg">
      {schema && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: schema }} />}

      <SectionHeader label="Help Center" heading="Frequently Asked Questions" subtext="Everything you need to know before your visit." />

      <div className="container-narrow !px-0">
        {faqs.length === 0 ? (
          <EmptyState
            icon={HelpCircle}
            heading="FAQs coming soon"
            description="We're compiling answers to common questions. Contact us directly in the meantime."
            action={{ label: "Contact Us", href: "/contact" }}
          />
        ) : (
          <FaqAccordion faqs={faqs} />
        )}
      </div>
    </Section>
  );
}
