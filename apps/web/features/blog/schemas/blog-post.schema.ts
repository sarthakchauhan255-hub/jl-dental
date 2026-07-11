import { BRAND } from "@/config/branding";
import { z } from "zod";
import { mediaAssetSchema } from "@/features/shared/schemas/section-base";

export const blogPostSchema = z.object({
  id:          z.string(),
  title:       z.string(),
  slug:        z.string(),
  excerpt:     z.string().default(""),
  content:     z.string().default(""),
  coverImage:  mediaAssetSchema.optional(),
  author:      z.string().default(BRAND.AUTHOR),
  category:    z.string().default("General"),
  tags:        z.array(z.string()).default([]),
  publishedAt: z.string().nullable(),
});

export type BlogPostContent = z.infer<typeof blogPostSchema>;
export const blogPostListSchema = z.array(blogPostSchema);
