import { Star } from "lucide-react";
import { Section, SectionHeader } from "@/components/common/section";
import type { TestimonialsPreviewContent } from "../schemas/testimonials-preview.schema";

export interface TestimonialItem {
  id:          string;
  patientName: string;
  rating:      number;
  comment:     string;
}

export function TestimonialsPreviewSection({
  content, testimonials,
}: { content: TestimonialsPreviewContent; testimonials: TestimonialItem[] }) {
  // Spec rule: no approved reviews → section hidden entirely (not empty carousel)
  if (!content.enabled || testimonials.length === 0) return null;

  return (
    <Section bg="primary">
      <SectionHeader label="Testimonials" heading={content.title} subtext={content.subtitle} />

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {testimonials.slice(0, 6).map((t) => (
          <div key={t.id}>
            <div className="card-base p-6 h-full flex flex-col">
              <div className="flex gap-0.5 mb-4" aria-label={`${t.rating} out of 5 stars`}>
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${i < t.rating ? "fill-accent-gold text-accent-gold" : "text-charcoal-200"}`}
                    aria-hidden="true"
                  />
                ))}
              </div>
              <p className="font-display italic text-charcoal-700 leading-relaxed flex-1">
                &ldquo;{t.comment}&rdquo;
              </p>
              <p className="mt-4 text-sm font-medium text-charcoal-900">{t.patientName}</p>
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}
