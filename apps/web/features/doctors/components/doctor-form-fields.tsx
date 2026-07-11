"use client";
/**
 * DoctorFormFields — fields layout for the doctor create/edit form.
 *
 * Receives FormHandle<DoctorInput> from CmsForm — never imports RHF directly.
 * Composed of CmsField primitives + SectionCards.
 */
import { SectionCard }  from "@/components/cms/section-card";
import { CmsField, CmsMediaField } from "@/components/cms/engine";
import type { FormHandle } from "@/components/cms/engine";
import type { DoctorInput } from "../service/doctors.service";

const FIELD_DEFS = {
  name:           { name: "name",           label: "Full Name",      type: "text"     as const, required: true, placeholder: "Dr. Jane Smith" },
  slug:           { name: "slug",           label: "URL Slug",       type: "slug"     as const, required: true, slugSource: "name", hint: "Used in /doctors/[slug]" },
  specialization: { name: "specialization", label: "Specialization", type: "text"     as const, required: true, placeholder: "Cosmetic & Restorative Dentistry" },
  bio:            { name: "bio",            label: "Biography",      type: "textarea" as const },
  order:          { name: "order",          label: "Display Order",  type: "number"   as const, hint: "Lower = earlier. 0 by default." },
  isActive:       { name: "isActive",       label: "Active",         type: "toggle"   as const, hint: "Visible on the public website" },
  seoTitle:       { name: "seo.title",      label: "SEO Title",      type: "text"     as const, hint: "Max 70 chars. Defaults to doctor name." },
  seoDesc:        { name: "seo.description",label: "SEO Description",type: "textarea" as const, hint: "Max 160 chars." },
};

interface DoctorFormFieldsProps {
  handle: FormHandle<DoctorInput>;
  isEdit?: boolean;
}

export function DoctorFormFields({ handle, isEdit }: DoctorFormFieldsProps) {
  return (
    <div className="space-y-6">
      <SectionCard title="Basic Information">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <CmsField config={FIELD_DEFS.name} handle={handle} />
          <CmsField
            config={{
              ...FIELD_DEFS.slug,
              immutableAfterCreate: isEdit,
            }}
            handle={handle}
          />
          <CmsField config={FIELD_DEFS.specialization} handle={handle} />
          <CmsField config={FIELD_DEFS.order} handle={handle} />
          <div className="sm:col-span-2">
            <CmsField config={FIELD_DEFS.bio} handle={handle} />
          </div>
          <CmsField config={FIELD_DEFS.isActive} handle={handle} />
        </div>
      </SectionCard>

      <SectionCard title="Profile Photo" description="Shown on the doctors page and homepage preview.">
        <CmsMediaField
          handle={handle} name="photo" label="Profile Photo"
          folder="doctors" withAlt aspectRatio="1/1"
          hint="Square crop recommended. JPEG/PNG/WebP up to the configured size limit."
        />
      </SectionCard>

      <SectionCard title="SEO" description="Search engine optimization metadata for the doctor's profile page.">
        <div className="space-y-4">
          <CmsField config={FIELD_DEFS.seoTitle} handle={handle} />
          <CmsField config={FIELD_DEFS.seoDesc} handle={handle} />
        </div>
      </SectionCard>
    </div>
  );
}
