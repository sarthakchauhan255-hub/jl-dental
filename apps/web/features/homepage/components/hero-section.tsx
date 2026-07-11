import Link from "next/link";
import { OptimizedImage } from "@/components/common/optimized-image";
import type { HeroContent } from "../schemas/hero.schema";
import { BRAND } from "@/config/branding";

/**
 * Hero section — pure Server Component. No Framer Motion.
 * Motion stays server-renderable via CSS animation classes.
 * Framer Motion deferred to interactive islands below the fold.
 */
export function HeroSection({ content }: { content: HeroContent }) {
  return (
    <section className="relative flex min-h-[85vh] lg:min-h-screen items-center overflow-hidden bg-gradient-to-br from-primary-900 via-primary-800 to-primary-700">
      {content.image?.url && (
        <div className="absolute inset-0">
          <OptimizedImage
            src={content.image.url}
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover opacity-30"
          />
        </div>
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-primary-900/80 via-transparent to-primary-900/40" aria-hidden="true" />

      <div className="container-base relative py-32">
        {/* CSS-only fade-up — no client JS needed */}
        <div className="animate-fade-up max-w-2xl">
          <p className="label-luxury text-primary-200 mb-5">{BRAND.TAGLINE_FULL}</p>
          <h1 className="heading-display text-white balance mb-6">
            {content.headline}
          </h1>
          <p className="body-lg text-primary-100/90 max-w-lg mb-10">
            {content.subheadline}
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href={content.ctaHref}
              className="inline-flex items-center justify-center rounded-lg bg-white px-7 py-3.5 text-sm font-medium text-primary-800 hover:bg-primary-50 transition-colors"
            >
              {content.ctaLabel}
            </Link>
            <Link
              href="/services"
              className="inline-flex items-center justify-center rounded-lg border border-white/30 px-7 py-3.5 text-sm font-medium text-white hover:bg-white/10 transition-colors"
            >
              View Services
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
