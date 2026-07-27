import { unstable_cache } from "next/cache";
import { connectDB } from "@/lib/db/connection";
import { Service }    from "@/models/Service";
import { mapServiceList, mapService } from "../mappers";
import { CACHE_TAGS, REVALIDATE } from "@/lib/cache";
import type { ServiceContent } from "../schemas/service.schema";

function toPlain(doc: unknown) { return JSON.parse(JSON.stringify(doc)); }

// Tagged cache → revalidateTag("services") purges instantly on any CMS change.
const getActiveServicesCached = unstable_cache(
  async (): Promise<ServiceContent[]> => {
    await connectDB();
    const docs = await Service.find({ isActive: true }).sort({ order: 1 }).lean();
    const mapped = docs.map((s) => toPlain({
      id: String(s._id), name: s.name, slug: s.slug, icon: s.icon,
      shortDesc: s.shortDesc, fullContent: s.fullContent,
      coverImage: s.coverImage, order: s.order,
    }));
    return mapServiceList(mapped);
  },
  ["active-services"],
  { tags: [CACHE_TAGS.services], revalidate: REVALIDATE.services },
);

export async function getActiveServices(): Promise<ServiceContent[]> {
  try { return await getActiveServicesCached(); }
  catch { return mapServiceList(null); }
}

export async function getServiceBySlug(slug: string): Promise<ServiceContent | null> {
  const cached = unstable_cache(
    async (): Promise<ServiceContent | null> => {
      await connectDB();
      const s = await Service.findOne({ slug, isActive: true }).lean();
      if (!s) return null;
      return mapService(toPlain({
        id: String(s._id), name: s.name, slug: s.slug, icon: s.icon,
        shortDesc: s.shortDesc, fullContent: s.fullContent,
        coverImage: s.coverImage, order: s.order,
      }));
    },
    ["service-by-slug", slug],
    { tags: [CACHE_TAGS.services], revalidate: REVALIDATE.services },
  );
  try { return await cached(); } catch { return null; }
}
