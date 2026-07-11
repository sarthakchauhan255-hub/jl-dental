import { BRAND } from "@/config/branding";
import { z } from "zod";
import { mediaAssetSchema } from "@/features/shared/schemas/section-base";

const dayHoursSchema = z.object({
  open:   z.string().default("09:00"),
  close:  z.string().default("18:00"),
  closed: z.boolean().default(false),
});

export const clinicPublicSchema = z.object({
  name:  z.string().default(BRAND.NAME),
  logo:  mediaAssetSchema.optional(),
  contact: z.object({
    phone:            z.string().default(""),
    whatsapp:         z.string().default(""),
    email:            z.string().default(""),
    address:          z.string().default(""),
    mapEmbedUrl:       z.string().default(""),
    mapDirectionsUrl:  z.string().default(""),
  }),
  location: z.object({ latitude: z.number(), longitude: z.number() }).nullable(),
  social: z.object({
    instagram:      z.string().default(""),
    facebook:       z.string().default(""),
    googleBusiness: z.string().default(""),
    whatsapp:       z.string().default(""),
  }),
  workingHours: z.object({
    monday:    dayHoursSchema,
    tuesday:   dayHoursSchema,
    wednesday: dayHoursSchema,
    thursday:  dayHoursSchema,
    friday:    dayHoursSchema,
    saturday:  dayHoursSchema,
    sunday:    dayHoursSchema,
  }),
});

export type ClinicPublicContent = z.infer<typeof clinicPublicSchema>;
