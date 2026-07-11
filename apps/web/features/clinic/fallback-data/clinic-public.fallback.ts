import { BRAND } from "@/config/branding";
import type { ClinicPublicContent } from "../schemas/clinic-public.schema";

const defaultDay = { open: "09:00", close: "18:00", closed: false };

export const clinicPublicFallback: ClinicPublicContent = {
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
    sunday:   { ...defaultDay, closed: true },
  },
};
