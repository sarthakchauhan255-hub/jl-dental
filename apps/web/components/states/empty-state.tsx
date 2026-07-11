import { cn }       from "@/lib/utils";
import { Button }   from "@/components/ui/button";
import type { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon?:        LucideIcon;
  heading:      string;
  description?: string;
  action?:      { label: string; href?: string; onClick?: () => void };
  size?:        "sm" | "md" | "lg";
  className?:   string;
}

/**
 * EmptyState — premium empty state that feels intentional, not broken.
 * Use for: no results, no content created yet, filtered to zero items.
 */
export function EmptyState({
  icon: Icon,
  heading,
  description,
  action,
  size = "md",
  className,
}: EmptyStateProps) {
  const padding = { sm: "py-8", md: "py-16", lg: "py-24" }[size];
  const iconSize = { sm: "h-8 w-8", md: "h-12 w-12", lg: "h-16 w-16" }[size];

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center",
        padding,
        className
      )}
      aria-label={heading}
    >
      {Icon && (
        <div className="mb-4 rounded-2xl bg-primary-50 p-4">
          <Icon className={cn(iconSize, "text-primary-400")} strokeWidth={1.5} />
        </div>
      )}

      <h3 className={cn(
        "font-display font-semibold tracking-tight text-foreground",
        size === "lg" ? "text-2xl" : size === "md" ? "text-xl" : "text-lg"
      )}>
        {heading}
      </h3>

      {description && (
        <p className="mt-2 max-w-sm text-sm text-muted-foreground leading-relaxed">
          {description}
        </p>
      )}

      {action && (
        <div className="mt-6">
          {action.href ? (
            <Button asChild size="md">
              <a href={action.href}>{action.label}</a>
            </Button>
          ) : (
            <Button onClick={action.onClick} size="md">
              {action.label}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
