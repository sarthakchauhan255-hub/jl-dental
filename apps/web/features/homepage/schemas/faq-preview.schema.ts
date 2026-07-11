import { z } from "zod";

export const faqPreviewSchema = z.object({
  enabled: z.boolean().default(true),
  title:   z.string().default("Common Questions"),
});

export type FaqPreviewContent = z.infer<typeof faqPreviewSchema>;
