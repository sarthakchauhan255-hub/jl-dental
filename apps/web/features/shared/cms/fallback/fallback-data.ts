import { BRAND } from "@/config/branding";
/**
 * Centralized fallback data for the LocalFallbackProvider.
 * Used when no DB is configured or during development without data.
 */
import type { ClinicPublicContent }  from "@/features/clinic/schemas/clinic-public.schema";
import type { HomepageSections }     from "../contracts/cms-provider.contract";
import type { TestimonialItem }      from "@/features/homepage/components/testimonials-preview-section";

const defaultDay = { open: "09:00", close: "18:00", closed: false };

export const fallbackClinic: ClinicPublicContent = {
  name: BRAND.NAME,
  logo: null,
  contact: {
    phone: "", whatsapp: "", email: "",
    address: "Solan, Himachal Pradesh",
    mapEmbedUrl: "", mapDirectionsUrl: "",
  },
  location: null,
  social: { instagram: "", facebook: "", googleBusiness: "", whatsapp: "" },
  workingHours: {
    monday: defaultDay, tuesday: defaultDay, wednesday: defaultDay,
    thursday: defaultDay, friday: defaultDay,
    saturday: { ...defaultDay, close: "14:00" },
    sunday: { ...defaultDay, closed: true },
  },
};

export const fallbackHomepageSections: HomepageSections = {
  hero: {
    headline:    "Your Smile, Our Expertise",
    subheadline: "Premium dental care in Solan, Himachal Pradesh.",
    ctaLabel:    "Book Appointment",
    ctaHref:     "/book",
    image:       null,
  },
  servicesPreview: { enabled: true, title: "Our Services",        subtitle: "Comprehensive dental care under one roof.", maxDisplay: 6 },
  doctorsPreview:  { enabled: true, title: "Meet Our Doctors",    subtitle: "" },
  testimonials:    { enabled: true, title: "What Our Patients Say", subtitle: "" },
  ctaBlock:        { enabled: true, headline: "Ready for a Beautiful Smile?", buttonLabel: "Book a Consultation", buttonHref: "/book" },
  faqPreview:      { enabled: true, title: "Common Questions" },
  galleryPreview:  { enabled: true, title: "Patient Results",     subtitle: "" },
};

export const fallbackTestimonials: TestimonialItem[] = [];
