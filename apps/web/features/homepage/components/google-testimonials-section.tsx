import { Star } from "lucide-react";
import { Section, SectionHeader } from "@/components/common/section";
import { GoogleReviewButton } from "@/components/common/google-review-button";
import { GOOGLE_REVIEWS } from "@/config/google-reviews";

/**
 * Homepage Google testimonials — real 5★ reviews from the clinic's Google
 * Business Profile (5.0 · 71 reviews). Responsive: 4-col desktop → 2-col tablet
 * → 1-col mobile. Sits above the footer. Edit TESTIMONIALS to change which show.
 */
type Testimonial = { name: string; text: string; treatment?: string };

const TESTIMONIALS: Testimonial[] = [
  {
    name: "Anubhav Sood",
    treatment: "General Dentistry",
    text: "I was nervous going in, as I've always been a bit scared of dental procedures, but Dr. Tanya made me feel comfortable and at ease from the start. Patient, gentle, and thorough — I left feeling genuinely cared for.",
  },
  {
    name: "Rishabh Srivastava",
    treatment: "Dental Treatment",
    text: "Dr. Tanya was very kind and professional. Fixed everything without me feeling any pain or discomfort. She made a clear plan outlining the treatment and cost — which left me with peace of mind and no surprises.",
  },
  {
    name: "Atul Goel",
    treatment: "Toothache",
    text: "I wasn't expecting much, but was pleasantly surprised by the warmth I received from the doctor and staff. They took time to explain the cause and what I could do at home. Highly recommended for their gentle nature.",
  },
  {
    name: "Rabia Brar",
    treatment: "General Care",
    text: "An amazing experience. The clinic and tools used are very hygienic, the staff is very helpful, and they took the utmost care of me. I feel deeply satisfied with the service.",
  },
];

export function GoogleTestimonialsSection() {
  return (
    <Section bg="muted" size="lg">
      <SectionHeader
        label="What Our Patients Say"
        heading="Trusted by Solan"
        subtext={`Rated ${GOOGLE_REVIEWS.RATING} out of 5 across ${GOOGLE_REVIEWS.COUNT} Google reviews.`}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-4">
        {TESTIMONIALS.map((t, i) => (
          <figure
            key={i}
            className="flex flex-col rounded-2xl border border-charcoal-100 bg-white p-6 shadow-sm"
          >
            <div className="flex gap-0.5 mb-4" aria-label="Rated 5 out of 5 stars">
              {Array.from({ length: 5 }).map((_, s) => (
                <Star key={s} className="h-4 w-4 fill-amber-400 text-amber-400" aria-hidden="true" />
              ))}
            </div>
            <blockquote className="body-sm text-charcoal-700 flex-1 leading-relaxed">
              &ldquo;{t.text}&rdquo;
            </blockquote>
            <figcaption className="mt-5 pt-4 border-t border-charcoal-100">
              <p className="font-medium text-charcoal-900">{t.name}</p>
              {t.treatment && (
                <p className="text-xs text-muted-foreground mt-0.5">{t.treatment} · via Google</p>
              )}
            </figcaption>
          </figure>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10">
        <GoogleReviewButton label="Write a Google review" />
        <a
          href={GOOGLE_REVIEWS.PROFILE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-medium text-primary-700 hover:underline"
        >
          Read all {GOOGLE_REVIEWS.COUNT} reviews →
        </a>
      </div>
    </Section>
  );
}
