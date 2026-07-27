import { unstable_cache } from "next/cache";
import { connectDB } from "@/lib/db/connection";
import { Gallery }   from "@/models/Gallery";
import { mapGalleryList } from "../mappers";
import { CACHE_TAGS, REVALIDATE } from "@/lib/cache";
import type { GalleryItemContent } from "../schemas/gallery-item.schema";

function toPlain(doc: unknown) { return JSON.parse(JSON.stringify(doc)); }

const getGalleryItemsCached = unstable_cache(
  async (): Promise<GalleryItemContent[]> => {
    await connectDB();
    const docs = await Gallery.find({ isActive: true }).sort({ order: 1 }).lean();
    const mapped = docs.map((g) => toPlain({
      id: String(g._id), type: g.type, category: g.category,
      caption: g.caption, before: g.before, after: g.after,
      image: g.image, order: g.order,
    }));
    return mapGalleryList(mapped);
  },
  ["gallery-items"],
  { tags: [CACHE_TAGS.gallery], revalidate: REVALIDATE.gallery },
);

export async function getGalleryItems(): Promise<GalleryItemContent[]> {
  try { return await getGalleryItemsCached(); }
  catch { return mapGalleryList(null); }
}
