import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { FaqPreviewAccordion } from "./faq-preview-accordion";
import type { FaqPreviewContent } from "../schemas/faq-preview.schema";
import type { FaqItemContent }    from "@/features/faq/schemas/faq-item.schema";

/**
 * Server Component shell — renders section chrome.
 * Accordion interaction delegated to FaqPreviewAccordion (client island).
 */
export function FaqPreviewSection({
  content, faqs,
}: { content: FaqPreviewContent; faqs: FaqItemContent[] }) {
  if (!content.enabled || faqs.length === 0) return null;

  return (
    <section className="py-16 md:py-24 lg:py-32 bg-muted/50">
      <div className="container-narrow">
        <div className="flex flex-col items-center text-center gap-3 mb-12">
          <span className="label-luxury">FAQ</span>
          <h2 className="heading-2 balance">{content.title}</h2>
          <div className="divider-luxury mt-1" aria-hidden="true" />
        </div>

        {/* Only the accordion interaction needs client */}
        <FaqPreviewAccordion faqs={faqs.slice(0, 5)} />

        <div className="mt-10 text-center">
          <Link href="/faq" className="inline-flex items-center gap-1.5 text-sm font-medium text-primary-700 hover:text-primary-800">
            View all FAQs <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  );
}
