import { z } from "zod";
import { mediaAssetSchema } from "@/features/shared/schemas/section-base";

export const galleryItemSchema = z.object({
  id:       z.string(),
  type:     z.enum(["before_after", "general"]),
  category: z.string().default("General"),
  caption:  z.string().default(""),
  before:   mediaAssetSchema.optional(),
  after:    mediaAssetSchema.optional(),
  image:    mediaAssetSchema.optional(),
  order:    z.number().default(0),
});

export type GalleryItemContent = z.infer<typeof galleryItemSchema>;
export const galleryListSchema = z.array(galleryItemSchema);
