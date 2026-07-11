import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, ...props }, ref) => (
    <input
      type={type}
      ref={ref}
      className={cn(
        // Base — 48px height, 16px text (prevents iOS zoom), clean borders
        "flex h-12 w-full rounded-lg border bg-white px-4 py-3",
        "text-base text-foreground placeholder:text-charcoal-300",
        "transition-colors duration-150",
        // Border states
        error
          ? "border-destructive focus:border-destructive focus:ring-destructive/20"
          : "border-charcoal-200 focus:border-primary-700",
        // Focus — clean outline (no glow per spec)
        "focus:outline-none focus:ring-2 focus:ring-primary-700/10",
        // Disabled
        "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-muted",
        className
      )}
      {...props}
    />
  )
);
Input.displayName = "Input";

export { Input };
