"use client";
import { SectionCard } from "@/components/cms/section-card";
import { CmsField, CmsMediaField } from "@/components/cms/engine";
import type { FormHandle } from "@/components/cms/engine";
import type { ServiceInput } from "../service/services.service";

interface Props { handle: FormHandle<ServiceInput>; isEdit?: boolean }

export function ServiceFormFields({ handle, isEdit }: Props) {
  return (
    <div className="space-y-6">
      <SectionCard title="Basic Information">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <CmsField config={{ name:"name",      label:"Service Name",    type:"text",     required:true }} handle={handle} />
          <CmsField config={{ name:"slug",      label:"URL Slug",        type:"slug",     required:true, slugSource:"name", immutableAfterCreate:isEdit }} handle={handle} />
          <CmsField config={{ name:"icon",      label:"Icon Name",       type:"text",     hint:"Lucide icon name, e.g. 'tooth', 'shield'" }} handle={handle} />
          <CmsField config={{ name:"order",     label:"Display Order",   type:"number" }} handle={handle} />
          <div className="sm:col-span-2">
            <CmsField config={{ name:"shortDesc",  label:"Short Description", type:"textarea", required:true, hint:"Max 300 chars. Used in cards and SEO." }} handle={handle} />
          </div>
          <div className="sm:col-span-2">
            <CmsField config={{ name:"fullContent", label:"Full Content",  type:"textarea", hint:"Detailed description shown on the service detail page." }} handle={handle} />
          </div>
          <CmsField config={{ name:"isActive",   label:"Published",       type:"toggle",   hint:"Visible on the public website" }} handle={handle} />
          <CmsField config={{ name:"isFeatured", label:"Featured",        type:"toggle",   hint:"Highlighted on the homepage" }} handle={handle} />
        </div>
      </SectionCard>
      <SectionCard title="Featured Image" description="Shown on the service card and detail page.">
        <CmsMediaField
          handle={handle} name="coverImage" label="Featured Image"
          folder="services" aspectRatio="16/9"
        />
      </SectionCard>

      <SectionCard title="SEO">
        <div className="space-y-4">
          <CmsField config={{ name:"seo.title",       label:"SEO Title",       type:"text",     hint:"Max 70 chars." }} handle={handle} />
          <CmsField config={{ name:"seo.description", label:"SEO Description", type:"textarea", hint:"Max 160 chars." }} handle={handle} />
        </div>
      </SectionCard>
    </div>
  );
}
