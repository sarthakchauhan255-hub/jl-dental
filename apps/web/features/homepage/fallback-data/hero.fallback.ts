import type { HeroContent } from "../schemas/hero.schema";

/**
 * Default hero content shown when CMS data is unavailable or not yet configured.
 * This is what a fresh clinic deployment sees before an admin edits the homepage —
 * it must never look broken or empty.
 */
export const heroFallback: HeroContent = {
  headline:    "Your Smile, Our Expertise",
  subheadline: "Premium dental care in Solan, Himachal Pradesh.",
  ctaLabel:    "Book Appointment",
  ctaHref:     "/book",
  image:       null,
};
