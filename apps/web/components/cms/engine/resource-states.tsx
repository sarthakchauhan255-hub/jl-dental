import { AlertCircle, Lock, Trash2 } from "lucide-react";
import { Button }                    from "@/components/ui/button";
import { Skeleton }                  from "@/components/ui/skeleton";
import type { CmsError }            from "@/lib/cms/errors";
import { getCmsErrorMessage }        from "@/lib/cms/errors";
import Link                          from "next/link";

// ─── Loading state ────────────────────────────────────────────────────────────
export function CmsFormLoading() {
  return (
    <div className="space-y-6">
      {[1, 2, 3].map(i => (
        <div key={i} className="rounded-xl border border-border bg-white p-5 space-y-4">
          <Skeleton className="h-4 w-24 rounded" />
          <Skeleton className="h-10 w-full rounded" />
          <Skeleton className="h-10 w-full rounded" />
        </div>
      ))}
    </div>
  );
}

// ─── Permission denied ────────────────────────────────────────────────────────
export function CmsPermissionDenied({ adminPath }: { adminPath: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-charcoal-100 mb-4">
        <Lock className="h-6 w-6 text-charcoal-500" aria-hidden="true" />
      </div>
      <h2 className="text-base font-semibold text-charcoal-900 mb-1">Access Denied</h2>
      <p className="text-sm text-charcoal-500 mb-5 max-w-xs">
        You don&apos;t have permission to view this page.
      </p>
      <Button asChild variant="secondary" size="sm">
        <Link href={adminPath}>Go Back</Link>
      </Button>
    </div>
  );
}

// ─── Not found ────────────────────────────────────────────────────────────────
export function CmsNotFound({ label, adminPath }: { label: string; adminPath: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-charcoal-100 mb-4">
        <Trash2 className="h-6 w-6 text-charcoal-500" aria-hidden="true" />
      </div>
      <h2 className="text-base font-semibold text-charcoal-900 mb-1">{label} Not Found</h2>
      <p className="text-sm text-charcoal-500 mb-5">
        This item may have been deleted or the URL is incorrect.
      </p>
      <Button asChild variant="secondary" size="sm">
        <Link href={adminPath}>Back to {label}s</Link>
      </Button>
    </div>
  );
}

// ─── Error state ──────────────────────────────────────────────────────────────
export function CmsErrorState({
  error, label, onRetry,
}: {
  error:    CmsError;
  label?:   string;
  onRetry?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-50 mb-4">
        <AlertCircle className="h-6 w-6 text-red-500" aria-hidden="true" />
      </div>
      <h2 className="text-base font-semibold text-charcoal-900 mb-1">Something went wrong</h2>
      <p className="text-sm text-charcoal-500 mb-5 max-w-xs">
        {getCmsErrorMessage(error, label)}
      </p>
      {onRetry && (
        <Button onClick={onRetry} variant="secondary" size="sm">
          Try again
        </Button>
      )}
    </div>
  );
}
