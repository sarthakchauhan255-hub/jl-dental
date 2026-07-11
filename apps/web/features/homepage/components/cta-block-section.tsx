import Link from "next/link";
import { Section } from "@/components/common/section";
import type { CtaBlockContent } from "../schemas/cta-block.schema";

export function CtaBlockSection({ content }: { content: CtaBlockContent }) {
  if (!content.enabled) return null;

  return (
    <Section bg="dark" size="sm">
      <div className="text-center max-w-2xl mx-auto">
        <h2 className="heading-2 text-white balance mb-8">{content.headline}</h2>
        <Link
          href={content.buttonHref}
          className="inline-flex items-center justify-center rounded-lg bg-primary-600 px-8 py-3.5 text-sm font-medium text-white hover:bg-primary-500 transition-colors"
        >
          {content.buttonLabel}
        </Link>
      </div>
    </Section>
  );
}
