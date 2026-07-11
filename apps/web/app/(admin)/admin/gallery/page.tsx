import type { Metadata }    from "next";
import { redirect }         from "next/navigation";
import { getAuthUser }      from "@/lib/auth/session";
import { hasPermission }    from "@/lib/auth/rbac";
import { connectDB }        from "@/lib/db/connection";
import { Gallery }          from "@/models/Gallery";
import { ResourceListPage } from "@/components/cms/engine";
import { galleryConfig }    from "@/features/gallery/config/gallery.config";
import { galleryService }   from "@/features/gallery/service/gallery.service";
import type { GalleryRecord } from "@/features/gallery/service/gallery.service";
import { mapGallery }          from "@/lib/db/mappers";

export const dynamic   = "force-dynamic";
export const metadata: Metadata = { title: "Gallery | Admin", robots: { index: false, follow: false } };

export default async function GalleryAdminPage() {
  const user = await getAuthUser();
  if (!user || !hasPermission(user.role, "gallery.read")) redirect("/admin/dashboard");

  await connectDB();
  const [docs, total] = await Promise.all([
    Gallery.find().sort({ order: 1 }).limit(10).lean(),
    Gallery.countDocuments(),
  ]);

  const initialData: GalleryRecord[] = docs.map(mapGallery) as GalleryRecord[];

  return (
    <ResourceListPage
      config={galleryConfig}
      service={galleryService}
      initialData={initialData}
      initialTotal={total}
      user={user}
    />
  );
}
