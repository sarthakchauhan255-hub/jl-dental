import { cn }      from "@/lib/utils";
import { Spinner } from "@/components/common/spinner";

interface LoadingStateProps {
  message?:   string;
  size?:      "sm" | "md" | "lg";
  className?: string;
  /** Use this for full-section loading placeholders */
  fullSection?: boolean;
}

/**
 * LoadingState — consistent loading indicator.
 * Prefer Skeleton for known content shapes.
 * Use this for indeterminate load states.
 */
export function LoadingState({
  message,
  size = "md",
  className,
  fullSection = false,
}: LoadingStateProps) {
  const padding = fullSection
    ? "py-20"
    : { sm: "py-4", md: "py-8", lg: "py-16" }[size];

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3",
        padding,
        className
      )}
      role="status"
      aria-label={message ?? "Loading"}
    >
      <Spinner size={size === "sm" ? "sm" : size === "lg" ? "lg" : "md"} />
      {message && (
        <p className="text-sm text-muted-foreground animate-pulse">
          {message}
        </p>
      )}
    </div>
  );
}
