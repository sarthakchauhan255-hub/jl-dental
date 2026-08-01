"use client";
import { useState, useMemo } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Reveal } from "@/components/common/motion";
import type { FaqItemContent } from "../schemas/faq-item.schema";

/** Accordion FAQ — grouped by category, reveals on scroll, smooth expand. */
export function FaqAccordion({ faqs }: { faqs: FaqItemContent[] }) {
  const [openId, setOpenId] = useState<string | null>(faqs[0]?.id ?? null);

  const grouped = useMemo(() => {
    const map = new Map<string, FaqItemContent[]>();
    for (const faq of faqs) {
      const list = map.get(faq.category) ?? [];
      list.push(faq);
      map.set(faq.category, list);
    }
    return Array.from(map.entries());
  }, [faqs]);

  const showCategories = grouped.length > 1;

  return (
    <div className="space-y-12">
      {grouped.map(([category, items]) => (
        <div key={category}>
          {showCategories && (
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.14em] text-[hsl(var(--accent-cyan))]">
              {category}
            </p>
          )}
          <div className="space-y-3">
            {items.map((faq) => {
              const isOpen = openId === faq.id;
              return (
                <Reveal key={faq.id} variant="fadeUp">
                  <div
                    className={cn(
                      "overflow-hidden rounded-2xl border bg-card transition-colors duration-300",
                      isOpen ? "border-primary-200 shadow-sm" : "border-border/60",
                    )}
                  >
                    <button
                      type="button"
                      onClick={() => setOpenId(isOpen ? null : faq.id)}
                      aria-expanded={isOpen}
                      aria-controls={`faq-${faq.id}`}
                      className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 focus-visible:ring-inset md:px-6 md:py-5"
                    >
                      <span
                        className="text-base font-medium text-primary-900 md:text-lg"
                        style={{ fontFamily: "var(--font-display)" }}
                      >
                        {faq.question}
                      </span>
                      <span
                        className={cn(
                          "flex h-8 w-8 flex-none items-center justify-center rounded-full transition-colors duration-300",
                          isOpen ? "bg-primary-900 text-white" : "bg-primary-50 text-primary-700",
                        )}
                      >
                        <ChevronDown
                          className={cn("h-4 w-4 transition-transform duration-300", isOpen && "rotate-180")}
                          aria-hidden="true"
                        />
                      </span>
                    </button>
                    <div
                      id={`faq-${faq.id}`}
                      role="region"
                      className={cn(
                        "grid transition-all duration-300 ease-out",
                        isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
                      )}
                    >
                      <div className="overflow-hidden">
                        <p className="whitespace-pre-line px-5 pb-5 text-sm leading-relaxed text-muted-foreground md:px-6">
                          {faq.answer}
                        </p>
                      </div>
                    </div>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
