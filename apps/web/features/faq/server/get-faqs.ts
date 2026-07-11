import { connectDB } from "@/lib/db/connection";
import { FAQ }       from "@/models/FAQ";
import { mapFaqList } from "../mappers";
import type { FaqItemContent } from "../schemas/faq-item.schema";

function toPlain(doc: unknown) {
  return JSON.parse(JSON.stringify(doc));
}

export async function getActiveFaqs(): Promise<FaqItemContent[]> {
  try {
    await connectDB();
    const docs = await FAQ.find({ isActive: true }).sort({ order: 1 }).lean();
    const mapped = docs.map((f) => toPlain({
      id: String(f._id), question: f.question, answer: f.answer,
      category: f.category, order: f.order,
    }));
    return mapFaqList(mapped);
  } catch {
    return mapFaqList(null);
  }
}
