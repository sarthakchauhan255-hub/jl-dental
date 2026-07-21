import { unstable_cache } from "next/cache";
import { connectDB } from "@/lib/db/connection";
import { Doctor }    from "@/models/Doctor";
import { mapDoctorList, mapDoctor } from "../mappers";
import { CACHE_TAGS, REVALIDATE } from "@/lib/cache";
import type { DoctorContent } from "../schemas/doctor.schema";

function toPlain(doc: unknown) {
  return JSON.parse(JSON.stringify(doc));
}

/**
 * Cached list of active doctors.
 *
 * Wrapped in unstable_cache TAGGED with CACHE_TAGS.doctors so that
 * invalidateCmsCache() → revalidateTag("doctors") purges it INSTANTLY on any
 * create/update/delete. The `revalidate` acts only as a safety-net max age.
 * (Previously the page relied solely on the time-based revalidate, so deletes
 *  took up to an hour to appear publicly.)
 */
const getActiveDoctorsCached = unstable_cache(
  async (): Promise<DoctorContent[]> => {
    await connectDB();
    const docs = await Doctor.find({ isActive: true }).sort({ order: 1 }).lean();
    const mapped = docs.map((d) => toPlain({
      id: String(d._id), name: d.name, slug: d.slug,
      specialization: d.specialization, qualifications: d.qualifications,
      bio: d.bio, photo: d.photo, order: d.order,
    }));
    return mapDoctorList(mapped);
  },
  ["active-doctors"],
  { tags: [CACHE_TAGS.doctors], revalidate: REVALIDATE.doctors },
);

export async function getActiveDoctors(): Promise<DoctorContent[]> {
  try {
    return await getActiveDoctorsCached();
  } catch {
    return mapDoctorList(null);
  }
}

const getDoctorBySlugCached = (slug: string) =>
  unstable_cache(
    async (): Promise<DoctorContent | null> => {
      await connectDB();
      const d = await Doctor.findOne({ slug, isActive: true }).lean();
      if (!d) return null;
      return mapDoctor(toPlain({
        id: String(d._id), name: d.name, slug: d.slug,
        specialization: d.specialization, qualifications: d.qualifications,
        bio: d.bio, photo: d.photo, order: d.order,
      }));
    },
    ["doctor-by-slug", slug],
    { tags: [CACHE_TAGS.doctors], revalidate: REVALIDATE.doctors },
  )();

export async function getDoctorBySlug(slug: string): Promise<DoctorContent | null> {
  try {
    return await getDoctorBySlugCached(slug);
  } catch {
    return null;
  }
}