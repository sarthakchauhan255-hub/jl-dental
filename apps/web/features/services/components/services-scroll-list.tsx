"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ScrollFade } from "@/components/common/motion";
import { ServiceIcon } from "./service-icon";
import type { ServiceContent } from "../schemas/service.schema";

/**
 * Services presentation. Content is CMS-driven — this only controls layout/motion.
 *  • Desktop (md+): wide boxes; leaving cards fade + shrink into the background.
 *  • Mobile (<md):  solid cards that pin at the same spot and cleanly overlap —
 *    each card shows and holds, then the next rises up and fully covers it.
 *    No fade (cards are opaque), so nothing shows through. Reverses on scroll-up.
 */
export function ServicesScrollList({ services }: { services: ServiceContent[] }) {
  return (
    <>
      <div className="hidden md:block">
        <DesktopStack services={services} />
      </div>
      <div className="md:hidden">
        <MobileStack services={services} />
      </div>
    </>
  );
}

/* ─── Desktop ────────────────────────────────────────────────────────────────── */
function DesktopStack({ services }: { services: ServiceContent[] }) {
  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-8">
      {services.map((service) => (
        <ScrollFade key={service.id} floor={0.04} rise={56}>
          <Link
            href={`/services/${service.slug}`}
            className="group flex items-center gap-7 rounded-2xl border border-border/60 bg-card p-8 shadow-card transition-shadow duration-300 hover:shadow-lg"
          >
            <span className="flex h-16 w-16 flex-none items-center justify-center rounded-2xl bg-primary-50 text-primary-700 transition-colors duration-300 group-hover:bg-primary-100">
              <ServiceIcon name={service.icon} className="h-7 w-7" />
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

      <ScrollFade floor={0.04} rise={56} className="pt-2">
        <CtaPanel />
      </ScrollFade>
    </div>
  );
}

/* ─── Mobile: solid cards pin at the same spot and cleanly overlap ─────────────── */
function MobileStack({ services }: { services: ServiceContent[] }) {
  return (
    <div className="relative">
      {services.map((service, i) => (
        <div key={service.id} className="sticky top-20 mb-[28vh]" style={{ zIndex: i + 1 }}>
          <article className="flex h-[62vh] flex-col justify-center gap-5 rounded-3xl border border-border bg-card p-8">
            <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-50 text-primary-700">
              <ServiceIcon name={service.icon} className="h-8 w-8" />
            </span>
            <div>
              <p className="label-luxury mb-2">{`0${i + 1} — Service`}</p>
              <h2 className="heading-2 mb-3 text-primary-900">{service.name}</h2>
              <p className="body-base line-clamp-4 text-muted-foreground">{service.shortDesc}</p>
            </div>
            <Link
              href={`/services/${service.slug}`}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-primary-700"
            >
              Learn more
              <ArrowRight className="h-4 w-4 text-[hsl(var(--accent-cyan))]" aria-hidden="true" />
            </Link>
          </article>
        </div>
      ))}

      {/* Booking card — final card in the stack, highest layer, fully covers the last service */}
      <div className="sticky top-20 mb-[28vh]" style={{ zIndex: services.length + 1 }}>
        <CtaPanel mobile />
      </div>

      {/* Trailing room so the booking card rises all the way up and holds before the footer */}
      <div aria-hidden className="h-[50vh]" />
    </div>
  );
}

/* ─── Shared closing CTA ──────────────────────────────────────────────────────── */
function CtaPanel({ mobile }: { mobile?: boolean }) {
  return (
    <div
      className={
        "flex flex-col items-center gap-5 rounded-3xl bg-primary-900 px-8 text-center " +
        (mobile ? "h-[62vh] justify-center" : "py-12 md:py-16")
      }
    >
      <h2 className="heading-2 text-white">Ready for a beautiful smile?</h2>
      <p className="body-base max-w-md text-white/70">
        Book a consultation with our specialists and take the first step today.
      </p>
      <Link href="/book" className="btn-base bg-white px-6 py-3 text-primary-900 hover:bg-primary-50">
        Book a Consultation
      </Link>
    </div>
  );
}