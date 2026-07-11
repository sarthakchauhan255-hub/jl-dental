import { connectDB } from "@/lib/db/connection";
import { Service }   from "@/models/Service";
import { mapServiceList, mapService } from "../mappers";
import type { ServiceContent } from "../schemas/service.schema";

function toPlain(doc: unknown) {
  return JSON.parse(JSON.stringify(doc));
}

export async function getActiveServices(): Promise<ServiceContent[]> {
  try {
    await connectDB();
    const docs = await Service.find({ isActive: true }).sort({ order: 1 }).lean();
    const mapped = docs.map((s) => toPlain({
      id: String(s._id), name: s.name, slug: s.slug, icon: s.icon,
      shortDesc: s.shortDesc, fullContent: s.fullContent,
      coverImage: s.coverImage, order: s.order,
    }));
    return mapServiceList(mapped);
  } catch {
    return mapServiceList(null);
  }
}

export async function getServiceBySlug(slug: string): Promise<ServiceContent | null> {
  try {
    await connectDB();
    const s = await Service.findOne({ slug, isActive: true }).lean();
    if (!s) return null;
    return mapService(toPlain({
      id: String(s._id), name: s.name, slug: s.slug, icon: s.icon,
      shortDesc: s.shortDesc, fullContent: s.fullContent,
      coverImage: s.coverImage, order: s.order,
    }));
  } catch {
    return null;
  }
}
