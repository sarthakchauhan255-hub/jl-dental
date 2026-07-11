import { z } from "zod";

export const testimonialsPreviewSchema = z.object({
  enabled:  z.boolean().default(true),
  title:    z.string().default("What Our Patients Say"),
  subtitle: z.string().default(""),
});

export type TestimonialsPreviewContent = z.infer<typeof testimonialsPreviewSchema>;
