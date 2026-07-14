"use client";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function AdminError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("Admin page error:", error.digest ?? "no-digest");
  }, [error]);

  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center gap-4 text-center">
      <h2 className="text-lg font-semibold text-charcoal-900">Something went wrong loading this page</h2>
      <p className="text-sm text-charcoal-500 max-w-sm">
        The error has been logged. Try again, or navigate back to the dashboard.
      </p>
      <Button variant="secondary" size="sm" onClick={() => reset()}>Try again</Button>
    </div>
  );
}
