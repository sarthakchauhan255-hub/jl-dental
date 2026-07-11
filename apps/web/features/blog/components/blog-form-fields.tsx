"use client";
import { SectionCard } from "@/components/cms/section-card";
import { CmsField, CmsMediaField } from "@/components/cms/engine";
import type { FormHandle } from "@/components/cms/engine";
import type { BlogInput } from "../service/blog.service";

interface Props { handle: FormHandle<BlogInput>; isEdit?: boolean }

export function BlogFormFields({ handle, isEdit }: Props) {
  return (
    <div className="space-y-6">
      <SectionCard title="Content">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <CmsField config={{ name:"title", label:"Title", type:"text", required:true }} handle={handle} />
          <CmsField config={{ name:"slug",  label:"URL Slug", type:"slug", required:true, slugSource:"title", immutableAfterCreate:isEdit }} handle={handle} />
          <div className="sm:col-span-2">
            <CmsField config={{ name:"excerpt", label:"Excerpt", type:"textarea", hint:"Short summary. Max 500 chars. Used in post cards and SEO." }} handle={handle} />
          </div>
          <div className="sm:col-span-2">
            <CmsField config={{ name:"content", label:"Content", type:"textarea", hint:"Full article content." }} handle={handle} />
          </div>
          <CmsField config={{ name:"author",   label:"Author",   type:"text" }} handle={handle} />
          <CmsField config={{ name:"category", label:"Category", type:"text" }} handle={handle} />
          <CmsField config={{ name:"tags",     label:"Tags",     type:"tags", hint:"Comma-separated" }} handle={handle} />
          <CmsField config={{ name:"status",   label:"Status",   type:"select", options:[{label:"Draft",value:"draft"},{label:"Published",value:"published"}] }} handle={handle} />
        </div>
      </SectionCard>
      <SectionCard title="Featured Image" description="Used as the post cover and OpenGraph share image.">
        <CmsMediaField
          handle={handle} name="coverImage" label="Featured Image"
          folder="blog" aspectRatio="16/9"
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
