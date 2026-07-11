import { z } from "zod";

export const servicesPreviewSchema = z.object({
  enabled:    z.boolean().default(true),
  title:      z.string().default("Our Services"),
  subtitle:   z.string().default("Comprehensive dental care under one roof."),
  maxDisplay: z.number().int().min(1).max(12).default(6),
});

export type ServicesPreviewContent = z.infer<typeof servicesPreviewSchema>;
