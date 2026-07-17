"use client";
/**
 * GalleryListClient — client boundary for the gallery list page.
 *
 * WHY THIS EXISTS: config and service contain FUNCTIONS (cell renderers,
 * action executors, service methods). Next.js forbids passing functions from a
 * Server Component to a Client Component. This wrapper imports them on the
 * client side instead, so the server page only passes serializable data.
 */
import { ResourceListPage } from "@/components/cms/engine";
import { galleryConfig } from "@/features/gallery/config/gallery.config";
import { galleryService } from "@/features/gallery/service/gallery.service";
import type { GalleryRecord } from "@/features/gallery/service/gallery.service";
import type { AuthUser } from "@/types/auth";

export function GalleryListClient({
  initialData, initialTotal, user,
}: {
  initialData: GalleryRecord[];
  initialTotal: number;
  user: AuthUser | null;
}) {
  return (
    <ResourceListPage
      config={galleryConfig}
      service={galleryService}
      initialData={initialData}
      initialTotal={initialTotal}
      user={user}
    />
  );
}
