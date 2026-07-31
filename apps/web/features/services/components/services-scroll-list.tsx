"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ScrollFade } from "@/components/common/motion";
import { ServiceIcon } from "./service-icon";
import type { ServiceContent } from "../schemas/service.schema";

/**
 * Services page — vertical stack of wide boxes (icon · title · description)
 * with a strong scroll-linked fade, closing on a CTA that rises into the footer.
 * Content is CMS-driven; this component only controls presentation.
 */
export function ServicesScrollList({ services }: { services: ServiceContent[] }) {
  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6 md:gap-8">
      {services.map((service) => (
        <ScrollFade key={service.id} floor={0.04} rise={56}>
          <Link
            href={`/services/${service.slug}`}
            className="group flex items-center gap-5 rounded-2xl border border-border/60 bg-card p-6 shadow-card transition-shadow duration-300 hover:shadow-lg md:gap-7 md:p-8"
          >
            <span className="flex h-14 w-14 flex-none items-center justify-center rounded-2xl bg-primary-50 text-primary-700 transition-colors duration-300 group-hover:bg-primary-100 md:h-16 md:w-16">
              <ServiceIcon name={service.icon} className="h-6 w-6 md:h-7 md:w-7" />
            </span>
            <div className="min-w-0">
              <h2 className="heading-4 mb-1.5 text-primary-900">{service.name}</h2>
              <p className="body-sm mb-3 line-clamp-2 max-w-prose text-muted-foreground">
                {service.shortDesc}
              </p>
              <span className="inline-flex items-center gap-1.5 text-sm font-medium text-primary-700">
                Learn more
                <ArrowRight
                  className="h-3.5 w-3.5 text-[hsl(var(--accent-cyan))] transition-transform duration-300 group-hover:translate-x-1"
                  aria-hidden="true"
                />
              </span>
            </div>
          </Link>
        </ScrollFade>
      ))}

      {/* Closing CTA — rises in with the same motion, into the footer */}
      <ScrollFade floor={0.04} rise={56} className="pt-2">
        <div className="flex flex-col items-center gap-5 rounded-3xl bg-primary-900 px-8 py-12 text-center md:py-16">
          <h2 className="heading-2 text-white">Ready for a beautiful smile?</h2>
          <p className="body-base max-w-md text-white/70">
            Book a consultation with our specialists and take the first step today.
          </p>
          <Link
            href="/book"
            className="btn-base bg-white px-6 py-3 text-primary-900 hover:bg-primary-50"
          >
            Book a Consultation
          </Link>
        </div>
      </ScrollFade>
    </div>
  );
}
