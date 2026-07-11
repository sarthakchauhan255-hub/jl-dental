import { z } from "zod";

export const faqItemSchema = z.object({
  id:       z.string(),
  question: z.string(),
  answer:   z.string(),
  category: z.string().default("General"),
  order:    z.number().default(0),
});

export type FaqItemContent = z.infer<typeof faqItemSchema>;
export const faqListSchema = z.array(faqItemSchema);
