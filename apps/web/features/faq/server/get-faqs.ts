import { unstable_cache } from "next/cache";
import { connectDB } from "@/lib/db/connection";
import { FAQ }       from "@/models/FAQ";
import { mapFaqList } from "../mappers";
import { CACHE_TAGS, REVALIDATE } from "@/lib/cache";
import type { FaqItemContent } from "../schemas/faq-item.schema";

function toPlain(doc: unknown) { return JSON.parse(JSON.stringify(doc)); }

const getActiveFaqsCached = unstable_cache(
  async (): Promise<FaqItemContent[]> => {
    await connectDB();
    const docs = await FAQ.find({ isActive: true }).sort({ order: 1 }).lean();
    const mapped = docs.map((f) => toPlain({
      id: String(f._id), question: f.question, answer: f.answer,
      category: f.category, order: f.order,
    }));
    return mapFaqList(mapped);
  },
  ["active-faqs"],
  { tags: [CACHE_TAGS.faq], revalidate: REVALIDATE.faq },
);

export async function getActiveFaqs(): Promise<FaqItemContent[]> {
  try { return await getActiveFaqsCached(); }
  catch { return mapFaqList(null); }
}
