import type { Metadata }      from "next";
import { notFound, redirect } from "next/navigation";
import { getAuthUser }        from "@/lib/auth/session";
import { hasPermission }      from "@/lib/auth/rbac";
import { connectDB }          from "@/lib/db/connection";
import { Gallery }            from "@/models/Gallery";
import { ResourceEditPage }   from "@/components/cms/engine";
import { galleryConfig }      from "@/features/gallery/config/gallery.config";
import { galleryService }     from "@/features/gallery/service/gallery.service";
import { GalleryFormFields }  from "@/features/gallery/components/gallery-form-fields";
import { galleryItemUpdateSchema } from "@/lib/validations";
import { mapGallery }               from "@/lib/db/mappers";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Edit Gallery Item | Admin", robots: { index:false, follow:false } };

export default async function EditGalleryPage({ params }: { params: Promise<{id:string}> }) {
  const user = await getAuthUser();
  if (!user || !hasPermission(user.role, "gallery.update")) redirect("/admin/gallery");
  const {id} = await params;
  await connectDB();
  const rawDoc = await Gallery.findById(id).lean();
  if (!rawDoc) notFound();
  const dto = mapGallery(rawDoc);
  return (
    <ResourceEditPage
      config={galleryConfig} service={galleryService} schema={galleryItemUpdateSchema}
      record={dto as unknown as import("@/features/gallery/service/gallery.service").GalleryRecord}
      defaultValues={{ type: dto.type as "before_after"|"general",
        category: dto.category, caption: dto.caption,
        order: dto.order, isActive: dto.isActive,
        before: dto.before, after: dto.after, image: dto.image }}
    >
      {handle => <GalleryFormFields handle={handle} />}
    </ResourceEditPage>
  );
}
