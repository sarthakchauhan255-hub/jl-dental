import { z } from "zod";

export const ctaBlockSchema = z.object({
  enabled:     z.boolean().default(true),
  headline:    z.string().default("Ready for a Beautiful Smile?"),
  buttonLabel: z.string().default("Book a Consultation"),
  buttonHref:  z.string().default("/book"),
});

export type CtaBlockContent = z.infer<typeof ctaBlockSchema>;
