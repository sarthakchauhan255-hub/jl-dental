import { BRAND } from "@/config/branding";
/**
 * Zod validation schemas — single source of truth for all input validation.
 * Used in both API routes (server) and forms (client, for type inference).
 * Never import server-only modules here — this file is client-safe.
 */
import { z } from "zod";

// ─── Shared field validators ──────────────────────────────────────────────────
export const objectIdSchema   = z.string().regex(/^[a-f\d]{24}$/i, "Invalid ID format");
export const slugSchema       = z.string().min(1).max(100).regex(/^[a-z0-9-]+$/, "Slug: lowercase letters, numbers, hyphens only");
export const phoneSchema      = z.string().min(7).max(20).regex(/^\+?[\d\s\-()]+$/, "Invalid phone number");
export const urlSchema        = z.string().url("Must be a valid URL").optional().or(z.literal(""));
export const hexColorSchema   = z.string().regex(/^#[0-9a-fA-F]{6}$/, "Must be a valid hex color (e.g. #1a4b7a)");

export const mediaSchema = z.object({
  url:      z.string().url("Invalid media URL"),
  publicId: z.string().min(1, "publicId required"),
  alt:      z.string().max(200).optional(),
  width:    z.number().int().positive().optional(),
  height:   z.number().int().positive().optional(),
}).nullable();

export const seoSchema = z.object({
  title:       z.string().max(70, "SEO title max 70 characters").optional(),
  description: z.string().max(160, "SEO description max 160 characters").optional(),
  ogImage:     mediaSchema.optional(),
  noIndex:     z.boolean().optional(),
}).optional();

// ─── Auth ─────────────────────────────────────────────────────────────────────
export const loginSchema = z.object({
  email:    z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword:     z.string().min(8, "Password must be at least 8 characters")
                     .regex(/[a-zA-Z]/, "Must contain a letter")
                     .regex(/\d/, "Must contain a number"),
  confirmPassword: z.string(),
}).refine((d) => d.newPassword === d.confirmPassword, {
  message: "Passwords do not match",
  path:    ["confirmPassword"],
});

export const resetPasswordRequestSchema = z.object({
  email: z.string().email(),
});

export const resetPasswordSchema = z.object({
  token:    z.string().min(1),
  password: z.string().min(8).regex(/[a-zA-Z]/).regex(/\d/),
});

// ─── Appointment ──────────────────────────────────────────────────────────────
export const appointmentSchema = z.object({
  patientName:    z.string().min(2, "Name required").max(100),
  phone:          phoneSchema,
  email:          z.string().email("Invalid email address"),
  serviceId:      objectIdSchema.optional(),
  preferredDate:  z.string().min(1, "Preferred date required")
                    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date format: YYYY-MM-DD"),
  preferredTime:  z.enum(["morning", "afternoon", "evening"], { error: "Please select a time" }),
  urgencyLevel:   z.enum(["normal", "soon", "urgent"]).default("normal"),
  notes:          z.string().max(500).optional().default(""),
  isNewPatient:   z.boolean().optional().default(true),
  referralSource: z.string().max(100).optional().default(""),
  honeypot:       z.string().max(0, "Bot detected").optional(), // Must be empty
});

export const appointmentStatusUpdateSchema = z.object({
  status:        z.enum(["approved", "rescheduled", "rejected", "cancelled", "completed", "no_show"]),
  adminNotes:    z.string().max(1000).optional().default(""),
  confirmedDate: z.string().optional(),
  confirmedTime: z.string().optional(),
});

// ─── Doctor ───────────────────────────────────────────────────────────────────
export const doctorSchema = z.object({
  name:           z.string().min(2).max(100),
  slug:           slugSchema,
  specialization: z.string().min(2).max(100),
  qualifications: z.array(z.string().max(100)).max(15).default([]),
  bio:            z.string().max(3000).optional().default(""),
  order:          z.number().int().min(0).default(0),
  isActive:       z.boolean().default(true),
  photo:          mediaSchema.optional(),
  seo:            seoSchema,
});

// ─── Service ──────────────────────────────────────────────────────────────────
export const serviceSchema = z.object({
  name:        z.string().min(2).max(100),
  slug:        slugSchema,
  icon:        z.string().max(50).optional().default(""),
  shortDesc:   z.string().min(10, "Short description too short").max(300),
  fullContent: z.string().optional().default(""),
  order:       z.number().int().min(0).default(0),
  isActive:    z.boolean().default(true),
  coverImage:  mediaSchema.optional(),
  seo:         seoSchema,
});

// ─── Blog ─────────────────────────────────────────────────────────────────────
export const blogPostSchema = z.object({
  title:      z.string().min(3, "Title required").max(200),
  slug:       slugSchema,
  content:    z.string().default(""),
  excerpt:    z.string().max(300).optional().default(""),
  author:     z.string().max(100).optional().default(BRAND.AUTHOR),
  tags:       z.array(z.string().max(50)).max(10).default([]),
  category:   z.string().max(50).optional().default("General"),
  status:     z.enum(["draft", "published"]).default("draft"),
  coverImage: mediaSchema.optional(),
  seo:        seoSchema,
});

// ─── FAQ ──────────────────────────────────────────────────────────────────────
export const faqSchema = z.object({
  question: z.string().min(5, "Question too short").max(300),
  answer:   z.string().min(5, "Answer too short").max(2000),
  category: z.string().max(50).optional().default("General"),
  order:    z.number().int().min(0).default(0),
  isActive: z.boolean().default(true),
});

// ─── Review ───────────────────────────────────────────────────────────────────
export const reviewSchema = z.object({
  patientName: z.string().min(2).max(100),
  rating:      z.number().int().min(1).max(5),
  comment:     z.string().min(5, "Review too short").max(1000),
});

// ─── Gallery ──────────────────────────────────────────────────────────────────
export const galleryItemSchema = z.object({
  type:     z.enum(["before_after", "general"]),
  category: z.string().max(50).optional().default("General"),
  caption:  z.string().max(200).optional().default(""),
  order:    z.number().int().min(0).default(0),
  isActive: z.boolean().default(true),
  before:   mediaSchema.optional(),
  after:    mediaSchema.optional(),
  image:    mediaSchema.optional(),
});

// ─── Clinic config ────────────────────────────────────────────────────────────
export const clinicContactSchema = z.object({
  phone:            z.string().max(20).optional().default(""),
  whatsapp:         z.string().max(20).optional().default(""),
  email:            z.string().email().optional().or(z.literal("")).default(""),
  address:          z.string().max(300).optional().default(""),
  mapEmbedUrl:      urlSchema,
  mapDirectionsUrl: urlSchema,
});

export const clinicLocationSchema = z.object({
  latitude:  z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
});

export const clinicSocialSchema = z.object({
  instagram:      urlSchema,
  facebook:       urlSchema,
  googleBusiness: urlSchema,
  whatsapp:       z.string().max(20).optional().or(z.literal("")),
});

export const clinicHeroSchema = z.object({
  headline:    z.string().max(100).optional().default("Your Smile, Our Expertise"),
  subheadline: z.string().max(200).optional().default(""),
  ctaLabel:    z.string().max(50).optional().default("Book Appointment"),
  ctaHref:     z.string().max(100).optional().default("/appointments"),
  image:       mediaSchema.optional(),
});

// ─── Media upload ─────────────────────────────────────────────────────────────
export const mediaUploadSchema = z.object({
  folder: z.enum([
    "clinic", "doctors", "services", "blog", "gallery/before-after", "gallery/general",
  ]).optional().default("clinic"),
});

export const mediaDeleteSchema = z.object({
  publicId: z.string().min(1),
});

// ─── Inferred types ───────────────────────────────────────────────────────────
export type LoginInput                  = z.infer<typeof loginSchema>;
export type ChangePasswordInput         = z.infer<typeof changePasswordSchema>;
export type AppointmentInput            = z.infer<typeof appointmentSchema>;
export type AppointmentStatusUpdateInput = z.infer<typeof appointmentStatusUpdateSchema>;
export type DoctorInput                 = z.infer<typeof doctorSchema>;
export type ServiceInput                = z.infer<typeof serviceSchema>;
export type BlogPostInput               = z.infer<typeof blogPostSchema>;
export type FAQInput                    = z.infer<typeof faqSchema>;
export type ReviewInput                 = z.infer<typeof reviewSchema>;
export type GalleryItemInput            = z.infer<typeof galleryItemSchema>;
export type ClinicContactInput          = z.infer<typeof clinicContactSchema>;
export type ClinicLocationInput         = z.infer<typeof clinicLocationSchema>;
export type ClinicHeroInput             = z.infer<typeof clinicHeroSchema>;
export type MediaUploadInput            = z.infer<typeof mediaUploadSchema>;

export const clinicUpdateSchema = z.object({
  name:        z.string().min(1).max(100).optional(),
  tagline:     z.string().max(200).optional(),
  description: z.string().max(2000).optional(),
  contact: z.object({
    phone:           z.string().max(20).optional(),
    whatsapp:        z.string().max(20).optional(),
    email:           z.string().email().optional(),
    address:         z.string().max(300).optional(),
    mapEmbedUrl:     z.string().url().optional().or(z.literal("")),
    mapDirectionsUrl:z.string().url().optional().or(z.literal("")),
  }).optional(),
  social: z.object({
    instagram:      z.string().max(200).optional(),
    facebook:       z.string().max(200).optional(),
    googleBusiness: z.string().max(200).optional(),
    whatsapp:       z.string().max(200).optional(),
  }).optional(),
  seo: z.object({
    defaultTitle:       z.string().max(70).optional(),
    defaultDescription: z.string().max(160).optional(),
  }).optional(),
  logo: z.object({
    url:      z.string().url(),
    publicId: z.string().min(1),
    alt:      z.string().max(120).optional(),
  }).nullable().optional(),
  homepage: z.object({
    hero: z.object({
      headline:    z.string().min(1).max(120),
      subheadline: z.string().max(240).default(""),
      ctaLabel:    z.string().max(40).default("Book Appointment"),
      ctaHref:     z.string().max(200).default("/book"),
      image: z.object({
        url:      z.string().url(),
        publicId: z.string().min(1),
        alt:      z.string().max(120).optional(),
      }).nullable().optional(),
    }).optional(),
    servicesPreview: z.object({ enabled: z.boolean(), title: z.string().max(80), subtitle: z.string().max(160).default(""), maxDisplay: z.number().int().min(1).max(12).default(6) }).optional(),
    doctorsPreview:  z.object({ enabled: z.boolean(), title: z.string().max(80), subtitle: z.string().max(160).default("") }).optional(),
    testimonials:    z.object({ enabled: z.boolean(), title: z.string().max(80), subtitle: z.string().max(160).default("") }).optional(),
    ctaBlock:        z.object({ enabled: z.boolean(), headline: z.string().max(120), buttonLabel: z.string().max(40), buttonHref: z.string().max(200) }).optional(),
    faqPreview:      z.object({ enabled: z.boolean(), title: z.string().max(80) }).optional(),
    galleryPreview:  z.object({ enabled: z.boolean(), title: z.string().max(80), subtitle: z.string().max(160).default("") }).optional(),
  }).optional(),
}).strict();

export const homepageSectionSchema = z.object({
  section: z.string().min(1),
  data:    z.record(z.string(), z.unknown()),
});

// ─── Doctor schemas ──────────────────────────────────────────────────────────
export const doctorCreateSchema = z.object({
  name:           z.string().min(1).max(100),
  slug:           z.string().min(1).max(120).regex(/^[a-z0-9-]+$/),
  specialization: z.string().min(1).max(100),
  qualifications: z.array(z.string().max(100)).default([]),
  bio:            z.string().max(3000).default(""),
  experience:     z.number().int().min(0).optional(),
  languages:      z.array(z.string()).default([]),
  isActive:       z.boolean().default(true),
  order:          z.number().int().default(0),
  photo:          z.object({ url: z.string(), publicId: z.string() }).nullable().optional(),
});
export const doctorUpdateSchema = doctorCreateSchema.partial();

// ─── Service schemas ─────────────────────────────────────────────────────────
export const serviceCreateSchema = z.object({
  name:         z.string().min(1).max(100),
  slug:         z.string().min(1).max(120).regex(/^[a-z0-9-]+$/),
  icon:         z.string().max(50).default(""),
  shortDesc:    z.string().min(1).max(300),
  fullContent:  z.string().max(10000).default(""),
  isActive:     z.boolean().default(true),
  isFeatured:   z.boolean().default(false),
  order:        z.number().int().default(0),
  coverImage:   z.object({ url: z.string(), publicId: z.string() }).nullable().optional(),
});
export const serviceUpdateSchema = serviceCreateSchema.partial();

// ─── Blog schemas ────────────────────────────────────────────────────────────
export const blogPostCreateSchema = z.object({
  title:        z.string().min(1).max(200),
  slug:         z.string().min(1).max(220).regex(/^[a-z0-9-]+$/),
  excerpt:      z.string().max(500).default(""),
  content:      z.string().max(50000).default(""),
  status:       z.enum(["draft","published","archived"]).default("draft"),
  category:     z.string().max(50).default("General"),
  tags:         z.array(z.string().max(30)).default([]),
  author:       z.string().max(100).default(BRAND.AUTHOR),
  isFeatured:   z.boolean().default(false),
  coverImage:   z.object({ url: z.string(), publicId: z.string() }).nullable().optional(),
  publishedAt:  z.string().datetime().nullable().optional(),
  seo: z.object({
    title:       z.string().max(70).optional(),
    description: z.string().max(160).optional(),
    canonical:   z.string().url().optional(),
  }).optional(),
});
export const blogPostUpdateSchema = blogPostCreateSchema.partial();

// ─── Gallery schemas ─────────────────────────────────────────────────────────
export const galleryItemCreateSchema = z.object({
  type:     z.enum(["before_after","general"]),
  category: z.string().max(50).default("General"),
  caption:  z.string().max(300).default(""),
  altText:  z.string().max(200).default(""),
  isActive: z.boolean().default(true),
  order:    z.number().int().default(0),
  before:   z.object({ url: z.string(), publicId: z.string() }).nullable().optional(),
  after:    z.object({ url: z.string(), publicId: z.string() }).nullable().optional(),
  image:    z.object({ url: z.string(), publicId: z.string() }).nullable().optional(),
});
export const galleryItemUpdateSchema = galleryItemCreateSchema.partial();

// ─── FAQ schemas ─────────────────────────────────────────────────────────────
export const faqCreateSchema = z.object({
  question: z.string().min(1).max(300),
  answer:   z.string().min(1).max(2000),
  category: z.string().max(50).default("General"),
  isActive: z.boolean().default(true),
  order:    z.number().int().default(0),
});
export const faqUpdateSchema = faqCreateSchema.partial();

// ─── Review/Testimonial schemas ───────────────────────────────────────────────
export const reviewModerationSchema = z.object({
  status:  z.enum(["approved","rejected","pending"]),
  reason:  z.string().max(300).optional(),
});

export const reviewUpdateSchema = z.object({ status: z.enum(['pending','approved','rejected']).optional(), isFeatured: z.boolean().optional(), order: z.number().int().optional() });
