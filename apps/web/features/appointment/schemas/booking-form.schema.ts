import { z } from "zod";

export const bookingFormSchema = z.object({
  patientName:   z.string().min(2, "Please enter your full name").max(100),
  phone:         z.string().min(7, "Please enter a valid phone number").max(20),
  email:         z.string().email("Please enter a valid email"),
  serviceId:     z.string().optional(),
  preferredDate: z.string().min(1, "Please select a date"),
  preferredTime: z.enum(["morning", "afternoon", "evening"], { error: "Please select a time" }),
  urgencyLevel:  z.enum(["normal", "soon", "urgent"]).default("normal"),
  notes:         z.string().max(500).optional().default(""),
  honeypot:      z.string().max(0).optional(),
});

export type BookingFormValues = z.infer<typeof bookingFormSchema>;
