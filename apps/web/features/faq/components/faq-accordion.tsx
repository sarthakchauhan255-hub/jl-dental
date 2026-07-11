"use client";
import { useState, useMemo } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { FaqItemContent } from "../schemas/faq-item.schema";

/** Client island: accordion expand state, grouped by category. */
export function FaqAccordion({ faqs }: { faqs: FaqItemContent[] }) {
  const [openId, setOpenId] = useState<string | null>(null);

  const grouped = useMemo(() => {
    const map = new Map<string, FaqItemContent[]>();
    for (const faq of faqs) {
      const list = map.get(faq.category) ?? [];
      list.push(faq);
      map.set(faq.category, list);
    }
    return Array.from(map.entries());
  }, [faqs]);

  return (
    <div className="space-y-10">
      {grouped.map(([category, items]) => (
        <div key={category}>
          <h2 className="heading-4 mb-4">{category}</h2>
          <div className="space-y-3">
            {items.map((faq) => {
              const isOpen = openId === faq.id;
              return (
                <div key={faq.id} className="rounded-xl border border-charcoal-100 bg-white overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setOpenId(isOpen ? null : faq.id)}
                    aria-expanded={isOpen}
                    aria-controls={`faq-${faq.id}`}
                    className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 focus-visible:ring-inset"
                  >
                    <span className="font-medium text-charcoal-900">{faq.question}</span>
                    <ChevronDown className={cn("h-4 w-4 flex-shrink-0 text-charcoal-400 transition-transform duration-250", isOpen && "rotate-180")} aria-hidden="true" />
                  </button>
                  <div id={`faq-${faq.id}`} role="region" className={cn("grid transition-all duration-250", isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]")}>
                    <div className="overflow-hidden">
                      <p className="px-5 pb-4 text-sm text-muted-foreground leading-relaxed">{faq.answer}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
