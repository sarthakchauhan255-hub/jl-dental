"use client";
import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function PublicError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    // Digest only — never surface internals to visitors
    console.error("Public page error:", error.digest ?? "no-digest");
  }, [error]);

  return (
    <section className="py-24">
      <div className="container-narrow text-center">
        <h1 className="heading-2 mb-4">Something went wrong</h1>
        <p className="body-base text-muted-foreground mb-8 max-w-md mx-auto">
          We couldn&apos;t load this page. Please try again — if the problem persists, feel free to call us.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Button variant="primary" onClick={() => reset()}>Try again</Button>
          <Button variant="secondary" asChild><Link href="/">Go home</Link></Button>
        </div>
      </div>
    </section>
  );
}
