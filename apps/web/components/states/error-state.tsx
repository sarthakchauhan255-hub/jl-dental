import { cn }     from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

interface ErrorStateProps {
  heading?:     string;
  description?: string;
  onRetry?:     () => void;
  size?:        "sm" | "md" | "lg";
  className?:   string;
}

/**
 * ErrorState — calm, non-alarming error presentation.
 * Always provides a recovery path.
 */
export function ErrorState({
  heading     = "Something went wrong",
  description = "An error occurred while loading this content. Please try again.",
  onRetry,
  size = "md",
  className,
}: ErrorStateProps) {
  const padding  = { sm: "py-8", md: "py-12", lg: "py-20" }[size];
  const iconSize = { sm: "h-8 w-8", md: "h-10 w-10", lg: "h-14 w-14" }[size];

  return (
    <div
      className={cn("flex flex-col items-center justify-center text-center", padding, className)}
      role="alert"
    >
      <div className="mb-4 rounded-2xl bg-red-50 p-4">
        <AlertCircle className={cn(iconSize, "text-red-400")} strokeWidth={1.5} />
      </div>

      <h3 className="font-display text-xl font-semibold tracking-tight text-foreground">
        {heading}
      </h3>

      <p className="mt-2 max-w-sm text-sm text-muted-foreground leading-relaxed">
        {description}
      </p>

      {onRetry && (
        <Button variant="secondary" size="md" onClick={onRetry} className="mt-6">
          Try Again
        </Button>
      )}
    </div>
  );
}
