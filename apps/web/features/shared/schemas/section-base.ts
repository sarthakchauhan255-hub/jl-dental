import { z } from "zod";

/**
 * Base schema fragments reused across homepage section schemas.
 * Every CMS-driven section follows: enabled toggle + content fields.
 */
export const mediaAssetSchema = z.object({
  url:      z.string(),
  publicId: z.string(),
  alt:      z.string().optional(),
}).nullable();

export const sectionToggleSchema = z.object({
  enabled: z.boolean().default(true),
});
