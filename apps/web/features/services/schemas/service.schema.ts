import { z } from "zod";
import { mediaAssetSchema } from "@/features/shared/schemas/section-base";

export const serviceSchema = z.object({
  id:          z.string(),
  name:        z.string(),
  slug:        z.string(),
  icon:        z.string().default(""),
  shortDesc:   z.string(),
  fullContent: z.string().default(""),
  coverImage:  mediaAssetSchema.optional(),
  order:       z.number().default(0),
});

export type ServiceContent = z.infer<typeof serviceSchema>;
export const serviceListSchema = z.array(serviceSchema);
