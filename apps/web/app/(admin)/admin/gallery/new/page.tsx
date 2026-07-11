import type { Metadata }         from "next";
import { redirect }              from "next/navigation";
import { getAuthUser }           from "@/lib/auth/session";
import { hasPermission }         from "@/lib/auth/rbac";
import { ResourceCreatePage }    from "@/components/cms/engine";
import { galleryConfig }         from "@/features/gallery/config/gallery.config";
import { galleryService }        from "@/features/gallery/service/gallery.service";
import { GalleryFormFields }     from "@/features/gallery/components/gallery-form-fields";
import { galleryItemCreateSchema } from "@/lib/validations";

export const metadata: Metadata = { title: "Add Gallery Item | Admin", robots: { index:false, follow:false } };

export default async function NewGalleryPage() {
  const user = await getAuthUser();
  if (!user || !hasPermission(user.role, "gallery.create")) redirect("/admin/gallery");
  return (
    <ResourceCreatePage config={galleryConfig} service={galleryService} schema={galleryItemCreateSchema}>
      {handle => <GalleryFormFields handle={handle} />}
    </ResourceCreatePage>
  );
}
