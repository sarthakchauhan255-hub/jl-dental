import { z } from "zod";
import { mediaAssetSchema } from "@/features/shared/schemas/section-base";

/**
 * Validated shape of homepage hero content, as it will arrive from the
 * Clinic CMS document (Phase 4 backend) or fallback data (Phase 5 default).
 */
export const heroSchema = z.object({
  headline:    z.string().min(1),
  subheadline: z.string().default(""),
  ctaLabel:    z.string().default("Book Appointment"),
  ctaHref:     z.string().default("/book"),
  image:       mediaAssetSchema.optional(),
});

export type HeroContent = z.infer<typeof heroSchema>;
