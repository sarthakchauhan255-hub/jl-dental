import { z } from "zod";

export const galleryPreviewSchema = z.object({
  enabled:  z.boolean().default(true),
  title:    z.string().default("Patient Results"),
  subtitle: z.string().default("Real transformations from our clinic."),
});

export type GalleryPreviewContent = z.infer<typeof galleryPreviewSchema>;
