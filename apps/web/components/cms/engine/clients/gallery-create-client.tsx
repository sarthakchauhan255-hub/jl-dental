"use client";
/**
 * GalleryCreateClient — client boundary for the gallery "new" page.
 * config/service/schema/form-fields all contain functions, which cannot be
 * passed from a Server Component. They are imported here on the client instead.
 */
import { ResourceCreatePage } from "@/components/cms/engine";
import { galleryConfig } from "@/features/gallery/config/gallery.config";
import { galleryService } from "@/features/gallery/service/gallery.service";
import { GalleryFormFields } from "@/features/gallery/components/gallery-form-fields";
import { galleryItemCreateSchema } from "@/lib/validations";
import type { ZodSchema } from "zod";
import type { GalleryInput } from "@/features/gallery/service/gallery.service";

export function GalleryCreateClient() {
  return (
    <ResourceCreatePage
      config={galleryConfig}
      service={galleryService}
      schema={galleryItemCreateSchema as unknown as ZodSchema<GalleryInput>}
    >
      {handle => <GalleryFormFields handle={handle} />}
    </ResourceCreatePage>
  );
}
