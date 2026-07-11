import { z } from "zod";
import { mediaAssetSchema } from "@/features/shared/schemas/section-base";

export const doctorSchema = z.object({
  id:             z.string(),
  name:           z.string(),
  slug:           z.string(),
  specialization: z.string(),
  qualifications: z.array(z.string()).default([]),
  bio:            z.string().default(""),
  photo:          mediaAssetSchema.optional(),
  order:          z.number().default(0),
});

export type DoctorContent = z.infer<typeof doctorSchema>;

export const doctorListSchema = z.array(doctorSchema);
