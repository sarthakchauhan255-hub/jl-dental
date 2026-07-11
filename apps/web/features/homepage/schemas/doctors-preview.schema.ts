import { z } from "zod";

export const doctorsPreviewSchema = z.object({
  enabled:  z.boolean().default(true),
  title:    z.string().default("Meet Our Doctors"),
  subtitle: z.string().default(""),
});

export type DoctorsPreviewContent = z.infer<typeof doctorsPreviewSchema>;
