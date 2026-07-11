import * as React from "react";
import { cn } from "@/lib/utils";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        "flex min-h-[120px] w-full rounded-lg border bg-white px-4 py-3",
        "text-base text-foreground placeholder:text-charcoal-300",
        "resize-y transition-colors duration-150",
        error
          ? "border-destructive focus:border-destructive"
          : "border-charcoal-200 focus:border-primary-700",
        "focus:outline-none focus:ring-2 focus:ring-primary-700/10",
        "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-muted",
        className
      )}
      {...props}
    />
  )
);
Textarea.displayName = "Textarea";

export { Textarea };
