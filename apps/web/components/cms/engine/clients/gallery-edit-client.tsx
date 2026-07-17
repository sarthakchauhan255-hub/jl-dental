"use client";
/**
 * GalleryEditClient — client boundary for the gallery edit page.
 * Receives ONLY serializable data (record, defaultValues); imports the
 * function-carrying config/service/schema/form-fields itself.
 */
import { ResourceEditPage } from "@/components/cms/engine";
import { galleryConfig } from "@/features/gallery/config/gallery.config";
import { galleryService } from "@/features/gallery/service/gallery.service";
import { GalleryFormFields } from "@/features/gallery/components/gallery-form-fields";
import { galleryItemUpdateSchema } from "@/lib/validations";
import type { ZodSchema } from "zod";
import type { GalleryRecord, GalleryInput } from "@/features/gallery/service/gallery.service";

export function GalleryEditClient({
  record, defaultValues,
}: {
  record: GalleryRecord;
  defaultValues: Partial<GalleryInput>;
}) {
  return (
    <ResourceEditPage
      config={galleryConfig}
      service={galleryService}
      schema={galleryItemUpdateSchema as unknown as ZodSchema<GalleryInput>}
      record={record}
      defaultValues={defaultValues}
    >
      {handle => <GalleryFormFields handle={handle} />}
    </ResourceEditPage>
  );
}
