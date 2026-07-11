import { connectDB } from "@/lib/db/connection";
import { Doctor }    from "@/models/Doctor";
import { mapDoctorList, mapDoctor } from "../mappers";
import type { DoctorContent } from "../schemas/doctor.schema";

function toPlain(doc: unknown) {
  return JSON.parse(JSON.stringify(doc));
}

export async function getActiveDoctors(): Promise<DoctorContent[]> {
  try {
    await connectDB();
    const docs = await Doctor.find({ isActive: true }).sort({ order: 1 }).lean();
    const mapped = docs.map((d) => toPlain({
      id: String(d._id), name: d.name, slug: d.slug,
      specialization: d.specialization, qualifications: d.qualifications,
      bio: d.bio, photo: d.photo, order: d.order,
    }));
    return mapDoctorList(mapped);
  } catch {
    return mapDoctorList(null);
  }
}

export async function getDoctorBySlug(slug: string): Promise<DoctorContent | null> {
  try {
    await connectDB();
    const d = await Doctor.findOne({ slug, isActive: true }).lean();
    if (!d) return null;
    return mapDoctor(toPlain({
      id: String(d._id), name: d.name, slug: d.slug,
      specialization: d.specialization, qualifications: d.qualifications,
      bio: d.bio, photo: d.photo, order: d.order,
    }));
  } catch {
    return null;
  }
}
