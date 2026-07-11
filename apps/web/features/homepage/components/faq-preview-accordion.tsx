"use client";
import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { FaqItemContent } from "@/features/faq/schemas/faq-item.schema";

/** Minimal client island — only accordion expand state. No motion, no Radix. */
export function FaqPreviewAccordion({ faqs }: { faqs: FaqItemContent[] }) {
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <div className="space-y-3">
      {faqs.map((faq) => {
        const isOpen = openId === faq.id;
        return (
          <div key={faq.id} className="rounded-xl border border-charcoal-100 bg-white overflow-hidden">
            <button
              type="button"
              onClick={() => setOpenId(isOpen ? null : faq.id)}
              aria-expanded={isOpen}
              aria-controls={`faq-preview-${faq.id}`}
              className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 focus-visible:ring-inset"
            >
              <span className="font-medium text-charcoal-900">{faq.question}</span>
              <ChevronDown
                className={cn("h-4 w-4 flex-shrink-0 text-charcoal-400 transition-transform duration-250", isOpen && "rotate-180")}
                aria-hidden="true"
              />
            </button>
            <div
              id={`faq-preview-${faq.id}`}
              role="region"
              className={cn("grid transition-all duration-250", isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]")}
            >
              <div className="overflow-hidden">
                <p className="px-5 pb-4 text-sm text-muted-foreground leading-relaxed">{faq.answer}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
