"use client";
/**
 * 500 / runtime error boundary — minimal branded standalone layout.
 * Always shows clinic contact info so patients are never stranded.
 */
import { useEffect } from "react";
import Link from "next/link";
import { BRAND } from "@/config/branding";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log to server-side monitoring (Sentry ready)
    console.error("[Error boundary]", error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 text-center">
      {/* Logo */}
      <div className="mb-8">
        <span className="font-display text-2xl font-semibold tracking-tight text-primary-700">
          {BRAND.SHORT_NAME}
        </span>
      </div>

      <p className="label-luxury mb-4 text-primary-600">Something went wrong</p>

      <h1 className="heading-2 mb-4 balance">
        We&apos;re sorry for the inconvenience
      </h1>

      <p className="body-base max-w-md text-muted-foreground mb-8">
        An unexpected error occurred. Our team has been notified.
        Please try again or contact us directly.
      </p>

      <div className="flex flex-col gap-3 sm:flex-row mb-10">
        <button
          onClick={reset}
          className="btn-base bg-primary-700 px-6 py-3 text-white hover:bg-primary-800 rounded-lg"
        >
          Try Again
        </button>
        <Link
          href="/"
          className="btn-base border border-primary-700 px-6 py-3 text-primary-700 hover:bg-primary-50 rounded-lg"
        >
          Back to Home
        </Link>
      </div>

      {/* Always show contact — patients must never be stranded */}
      <div className="text-sm text-muted-foreground">
        <p>Need immediate assistance?</p>
        <Link href="/contact" className="text-primary-600 hover:underline font-medium">
          Contact us directly →
        </Link>
      </div>
    </div>
  );
}
