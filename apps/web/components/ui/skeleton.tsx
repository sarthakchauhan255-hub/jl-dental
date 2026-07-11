import { cn } from "@/lib/utils";

/**
 * Skeleton — shimmer loading state.
 * Always size to match the content it replaces to prevent layout shift.
 */
function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "animate-shimmer rounded-md bg-gradient-to-r from-muted via-muted/60 to-muted",
        "[background-size:200%_100%]",
        className
      )}
      aria-hidden="true"
      {...props}
    />
  );
}

export { Skeleton };
