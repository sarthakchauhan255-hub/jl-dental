"use client";
import { SectionCard } from "@/components/cms/section-card";
import { CmsField }    from "@/components/cms/engine";
import type { FormHandle } from "@/components/cms/engine";
import type { FaqInput } from "../service/faq.service";

interface Props { handle: FormHandle<FaqInput> }

export function FaqFormFields({ handle }: Props) {
  return (
    <div className="space-y-6">
      <SectionCard title="FAQ Content">
        <div className="space-y-4">
          <CmsField config={{ name:"question", label:"Question",    type:"text",     required:true }} handle={handle} />
          <CmsField config={{ name:"answer",   label:"Answer",      type:"textarea", required:true }} handle={handle} />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <CmsField config={{ name:"category", label:"Category",     type:"text",   hint:"e.g. 'General', 'Procedures'" }} handle={handle} />
            <CmsField config={{ name:"order",    label:"Display Order",type:"number", hint:"Lower = earlier" }} handle={handle} />
            <CmsField config={{ name:"isActive", label:"Active",       type:"toggle", hint:"Visible on the public website" }} handle={handle} />
          </div>
        </div>
      </SectionCard>
    </div>
  );
}
