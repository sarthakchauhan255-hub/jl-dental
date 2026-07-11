/**
 * 404 page — minimal branded standalone layout (spec-confirmed).
 * No full navbar/footer — logo + message + recovery CTAs only.
 */
import Link from "next/link";
import type { Metadata } from "next";
import { BRAND } from "@/config/branding";

export const metadata: Metadata = {
  title: `Page Not Found${BRAND.TITLE_SUFFIX}`,
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 text-center">
      {/* Logo mark */}
      <div className="mb-8">
        <span className="font-display text-2xl font-semibold tracking-tight text-primary-700">
          {BRAND.SHORT_NAME}
        </span>
      </div>

      {/* Status */}
      <p className="label-luxury mb-4 text-primary-600">404 — Page not found</p>

      {/* Heading */}
      <h1 className="heading-2 mb-4 balance">
        We couldn&apos;t find that page
      </h1>

      {/* Message */}
      <p className="body-base max-w-md text-muted-foreground mb-10">
        The page you&apos;re looking for may have moved or no longer exists.
        Let&apos;s get you back on track.
      </p>

      {/* Recovery CTAs */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <Link
          href="/"
          className="btn-base bg-primary-700 px-6 py-3 text-white hover:bg-primary-800 rounded-lg"
        >
          Back to Home
        </Link>
        <Link
          href="/appointments"
          className="btn-base border border-primary-700 px-6 py-3 text-primary-700 hover:bg-primary-50 rounded-lg"
        >
          Book Appointment
        </Link>
      </div>
    </div>
  );
}
