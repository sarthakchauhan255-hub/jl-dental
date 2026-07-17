import type { Metadata }         from "next";
import { redirect }              from "next/navigation";
import { getAuthUser }           from "@/lib/auth/session";
import { GalleryCreateClient } from "@/components/cms/engine/clients/gallery-create-client";
import { hasPermission }         from "@/lib/auth/rbac";

export const metadata: Metadata = { title: "Add Gallery Item | Admin", robots: { index:false, follow:false } };

export default async function NewGalleryPage() {
  const user = await getAuthUser();
  if (!user || !hasPermission(user.role, "gallery.create")) redirect("/admin/gallery");
  return (
    <GalleryCreateClient />
  );
}
