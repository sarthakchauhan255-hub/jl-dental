import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        default:     "bg-primary-100 text-primary-700",
        secondary:   "bg-secondary text-secondary-foreground",
        success:     "bg-green-100 text-green-700",
        warning:     "bg-amber-100 text-amber-700",
        destructive: "bg-red-100 text-red-700",
        outline:     "border border-border text-foreground bg-transparent",
        gold:        "bg-accent-light text-amber-700",
        pending:     "bg-amber-100 text-amber-700",
        approved:    "bg-green-100 text-green-700",
        rejected:    "bg-red-100 text-red-700",
        completed:   "bg-blue-100 text-blue-700",
        expired:     "bg-charcoal-100 text-charcoal-500",
        cancelled:   "bg-charcoal-100 text-charcoal-600",
        no_show:     "bg-orange-100 text-orange-700",
        rescheduled: "bg-purple-100 text-purple-700",
      },
    },
    defaultVariants: { variant: "default" },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
