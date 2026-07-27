/**
 * Public read: approved reviews as homepage testimonials.
 * Server-only — called via the CmsProvider, never from components directly.
 * Tagged cache so approving/deleting a review updates the homepage instantly.
 */
import { unstable_cache } from "next/cache";
import { connectDB } from "@/lib/db/connection";
import { CACHE_TAGS, REVALIDATE } from "@/lib/cache";
import type { TestimonialItem } from "@/features/homepage/components/testimonials-preview-section";

const getApprovedTestimonialsCached = (limit: number) => unstable_cache(
  async (): Promise<TestimonialItem[]> => {
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
  },
  ["approved-testimonials", String(limit)],
  { tags: [CACHE_TAGS.reviews], revalidate: REVALIDATE.reviews },
)();

export async function getApprovedTestimonials(limit = 6): Promise<TestimonialItem[]> {
  try { return await getApprovedTestimonialsCached(limit); }
  catch { return []; }
}
