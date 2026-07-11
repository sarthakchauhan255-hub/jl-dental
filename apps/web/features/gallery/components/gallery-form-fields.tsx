"use client";
import { SectionCard }   from "@/components/cms/section-card";
import { CmsField, CmsMediaField } from "@/components/cms/engine";
import type { FormHandle } from "@/components/cms/engine";
import type { GalleryInput } from "../service/gallery.service";

interface Props { handle: FormHandle<GalleryInput> }

export function GalleryFormFields({ handle }: Props) {
  const typeValue = handle.getValue("type") as string;

  return (
    <div className="space-y-6">
      <SectionCard title="Gallery Item">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <CmsField config={{
            name: "type", label: "Type", type: "select", required: true,
            options: [
              { label: "Before / After Comparison", value: "before_after" },
              { label: "General Image",             value: "general"      },
            ],
          }} handle={handle} />
          <CmsField config={{ name: "category", label: "Category", type: "text", hint: "e.g. 'Whitening', 'Implants'" }} handle={handle} />
          <div className="sm:col-span-2">
            <CmsField config={{ name: "caption", label: "Caption", type: "textarea", hint: "Shown below the image" }} handle={handle} />
          </div>
          <CmsField config={{ name: "order",    label: "Display Order", type: "number" }} handle={handle} />
          <CmsField config={{ name: "isActive", label: "Published",     type: "toggle", hint: "Visible in gallery" }} handle={handle} />
        </div>
      </SectionCard>

      {(!typeValue || typeValue === "general") && (
        <SectionCard title="Image" description="The gallery image. Uploaded through the secure media pipeline.">
          <CmsMediaField
            handle={handle} name="image" label="Gallery Image"
            folder="gallery/general" required aspectRatio="4/3"
          />
        </SectionCard>
      )}

      {typeValue === "before_after" && (
        <SectionCard title="Before / After Images" description="Both images are required. They form one logical comparison — the pair is validated server-side.">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <CmsMediaField
              handle={handle} name="before" label="Before"
              folder="gallery/before-after" required aspectRatio="1/1"
            />
            <CmsMediaField
              handle={handle} name="after" label="After"
              folder="gallery/before-after" required aspectRatio="1/1"
            />
          </div>
        </SectionCard>
      )}
    </div>
  );
}
