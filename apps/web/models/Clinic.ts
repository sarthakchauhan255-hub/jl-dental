/**
 * Clinic model — CMS-driven configuration for the entire platform.
 * Single document per clinic in v1. clinicId on all other models for v2 multi-clinic.
 */
import mongoose, { Schema, type Document, type Model } from "mongoose";
import type { WorkingHours, ClinicSocialLinks, ClinicLocation } from "@/types";

// ─── Sub-schemas ──────────────────────────────────────────────────────────────
const MediaAssetSchema = new Schema(
  {
    url:      { type: String, default: "" },
    publicId: { type: String, default: "" },
    alt:      { type: String, default: "" },
    width:    { type: Number },
    height:   { type: Number },
  },
  { _id: false }
);

const SeoSchema = new Schema(
  {
    title:       { type: String, default: "" },
    description: { type: String, default: "" },
    ogImage:     { type: MediaAssetSchema, default: null },
    noIndex:     { type: Boolean, default: false },
  },
  { _id: false }
);

const DayHoursSchema = new Schema(
  {
    open:   { type: String, default: "09:00" },
    close:  { type: String, default: "18:00" },
    closed: { type: Boolean, default: false },
  },
  { _id: false }
);

const WorkingHoursSchema = new Schema(
  {
    monday:    { type: DayHoursSchema, default: {} },
    tuesday:   { type: DayHoursSchema, default: {} },
    wednesday: { type: DayHoursSchema, default: {} },
    thursday:  { type: DayHoursSchema, default: {} },
    friday:    { type: DayHoursSchema, default: {} },
    saturday:  { type: DayHoursSchema, default: { close: "14:00" } },
    sunday:    { type: DayHoursSchema, default: { closed: true } },
  },
  { _id: false }
);

// ─── Main interface ───────────────────────────────────────────────────────────
export interface IClinic extends Document {
  slug:        string;
  name:        string;
  tagline:     string;
  description: string;
  logo:   { url: string; publicId: string; alt?: string } | null;
  favicon:{ url: string; publicId: string } | null;

  brandColors: {
    primary:   string;
    secondary: string;
    accent:    string;
  };

  contact: {
    phone:            string;
    whatsapp:         string;
    email:            string;
    address:          string;
    mapEmbedUrl:      string;
    mapDirectionsUrl: string;
  };

  location: ClinicLocation | null;

  social: ClinicSocialLinks;

  workingHours: WorkingHours;

  seo: {
    defaultTitle:       string;
    defaultDescription: string;
    ogImage:            { url: string; publicId: string } | null;
  };

  homepage: {
    hero: {
      headline:    string;
      subheadline: string;
      ctaLabel:    string;
      ctaHref:     string;
      image:       { url: string; publicId: string } | null;
    };
    servicesPreview:  { enabled: boolean; title: string; subtitle: string; maxDisplay: number };
    doctorsPreview:   { enabled: boolean; title: string; subtitle: string };
    testimonials:     { enabled: boolean; title: string; subtitle: string };
    ctaBlock:         { enabled: boolean; headline: string; buttonLabel: string; buttonHref: string };
    faqPreview:       { enabled: boolean; title: string };
    galleryPreview:   { enabled: boolean; title: string; subtitle: string };
  };

  isActive:  boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ClinicSchema = new Schema<IClinic>(
  {
    slug:    { type: String, required: true, unique: true, lowercase: true },
    name:    { type: String, required: true, trim: true },
    tagline: { type: String, default: "" },
    logo:    { type: MediaAssetSchema, default: null },
    favicon: { type: MediaAssetSchema, default: null },

    brandColors: {
      primary:   { type: String, default: "#1d4ed8" },
      secondary: { type: String, default: "#1a1a1a" },
      accent:    { type: String, default: "#c9a84c" },
    },

    contact: {
      phone:            { type: String, default: "" },
      whatsapp:         { type: String, default: "" },
      email:            { type: String, default: "" },
      address:          { type: String, default: "" },
      mapEmbedUrl:      { type: String, default: "" },
      mapDirectionsUrl: { type: String, default: "" },
    },

    location: {
      type: new Schema(
        { latitude: Number, longitude: Number },
        { _id: false }
      ),
      default: null,
    },

    social: {
      instagram:      { type: String, default: "" },
      facebook:       { type: String, default: "" },
      googleBusiness: { type: String, default: "" },
      whatsapp:       { type: String, default: "" },
    },

    workingHours: { type: WorkingHoursSchema, default: {} },

    seo: {
      defaultTitle:       { type: String, default: "JL Dental Clinic" },
      defaultDescription: { type: String, default: "" },
      ogImage:            { type: MediaAssetSchema, default: null },
    },

    homepage: {
      hero: {
        headline:    { type: String, default: "Your Smile, Our Expertise" },
        subheadline: { type: String, default: "Premium dental care in Solan, Himachal Pradesh." },
        ctaLabel:    { type: String, default: "Book Appointment" },
        ctaHref:     { type: String, default: "/appointments" },
        image:       { type: MediaAssetSchema, default: null },
      },
      servicesPreview: {
        enabled:    { type: Boolean, default: true },
        title:      { type: String, default: "Our Services" },
        subtitle:   { type: String, default: "Comprehensive dental care under one roof." },
        maxDisplay: { type: Number, default: 6 },
      },
      doctorsPreview: {
        enabled:  { type: Boolean, default: true },
        title:    { type: String, default: "Meet Our Doctors" },
        subtitle: { type: String, default: "" },
      },
      testimonials: {
        enabled:  { type: Boolean, default: true },
        title:    { type: String, default: "What Our Patients Say" },
        subtitle: { type: String, default: "" },
      },
      ctaBlock: {
        enabled:     { type: Boolean, default: true },
        headline:    { type: String, default: "Ready for a Beautiful Smile?" },
        buttonLabel: { type: String, default: "Book a Consultation" },
        buttonHref:  { type: String, default: "/appointments" },
      },
      faqPreview: {
        enabled: { type: Boolean, default: true },
        title:   { type: String, default: "Common Questions" },
      },
      galleryPreview: {
        enabled:  { type: Boolean, default: true },
        title:    { type: String, default: "Patient Results" },
        subtitle: { type: String, default: "Real transformations from our clinic." },
      },
    },

    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

ClinicSchema.index({ slug: 1 }, { unique: true });

export const Clinic: Model<IClinic> =
  mongoose.models.Clinic ?? mongoose.model<IClinic>("Clinic", ClinicSchema);
