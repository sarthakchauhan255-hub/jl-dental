/**
 * Button — design-spec implementation.
 * Variants: primary (default), secondary, ghost, destructive, whatsapp.
 * Sizes: sm, md (default), lg.
 */
import * as React from "react";
import { Slot }   from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  // Base — matches spec: inline-flex, gap, rounded, font, transitions, focus, disabled
  "inline-flex items-center justify-center gap-2 rounded-lg font-sans font-medium " +
  "transition-all duration-250 focus-visible:outline-none focus-visible:ring-2 " +
  "focus-visible:ring-primary-400 focus-visible:ring-offset-2 " +
  "disabled:pointer-events-none disabled:opacity-45 select-none",
  {
    variants: {
      variant: {
        primary:
          "bg-primary-700 text-white shadow-sm " +
          "hover:bg-primary-800 hover:-translate-y-px hover:shadow-md " +
          "active:bg-primary-900 active:translate-y-0",
        secondary:
          "border border-primary-700 bg-transparent text-primary-700 " +
          "hover:bg-primary-50 hover:-translate-y-px " +
          "active:translate-y-0",
        ghost:
          "bg-transparent text-charcoal-600 " +
          "hover:bg-charcoal-50 " +
          "active:bg-charcoal-100",
        destructive:
          "bg-destructive text-destructive-foreground shadow-sm " +
          "hover:bg-destructive/90 hover:-translate-y-px",
        whatsapp:
          "bg-[#25D366] text-white shadow-sm " +
          "hover:bg-[#1ebe5d] hover:-translate-y-px hover:shadow-md " +
          "active:bg-[#18a050] active:translate-y-0",
        link:
          "text-primary-700 underline-offset-4 hover:underline p-0 h-auto",
      },
      size: {
        sm:   "h-9 px-4 text-sm tracking-wide",
        md:   "h-11 px-6 text-sm tracking-wide",
        lg:   "h-12 px-8 text-base tracking-wide",
        icon: "h-10 w-10 p-0",
      },
    },
    defaultVariants: {
      variant: "primary",
      size:    "md",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
