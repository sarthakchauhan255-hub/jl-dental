/**
 * Public read: approved reviews as homepage testimonials.
 * Server-only — called via the CmsProvider, never from components directly.
 */
import { connectDB } from "@/lib/db/connection";
import type { TestimonialItem } from "@/features/homepage/components/testimonials-preview-section";

export async function getApprovedTestimonials(limit = 6): Promise<TestimonialItem[]> {
  await connectDB();
  const { Review } = await import("@/models/Review");
  const rows = await Review.find({ status: "approved" })
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();

  return rows.map(r => {
    const doc = r as { _id: unknown; patientName?: string; rating?: number; comment?: string };
    return {
      id:          String(doc._id),
      patientName: doc.patientName ?? "",
      rating:      typeof doc.rating === "number" ? doc.rating : 5,
      comment:     doc.comment ?? "",
    };
  });
}
