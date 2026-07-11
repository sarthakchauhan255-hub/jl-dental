"use client";
import * as React from "react";
import * as SheetPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const Sheet        = SheetPrimitive.Root;
const SheetTrigger = SheetPrimitive.Trigger;
const SheetClose   = SheetPrimitive.Close;
const SheetPortal  = SheetPrimitive.Portal;

const SheetOverlay = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <SheetPrimitive.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-overlay bg-charcoal-900/40",
      "data-[state=open]:animate-fade-in",
      className
    )}
    {...props}
  />
));
SheetOverlay.displayName = "SheetOverlay";

const sheetVariants = cva(
  "fixed z-modal bg-white shadow-2xl transition-transform duration-300 ease-out-expo focus:outline-none",
  {
    variants: {
      side: {
        right:  "inset-y-0 right-0 h-full w-full max-w-sm data-[state=open]:translate-x-0 data-[state=closed]:translate-x-full",
        left:   "inset-y-0 left-0 h-full w-full max-w-sm data-[state=open]:translate-x-0 data-[state=closed]:-translate-x-full",
        top:    "inset-x-0 top-0 w-full data-[state=open]:translate-y-0 data-[state=closed]:-translate-y-full",
        bottom: "inset-x-0 bottom-0 w-full data-[state=open]:translate-y-0 data-[state=closed]:translate-y-full",
      },
    },
    defaultVariants: { side: "right" },
  }
);

interface SheetContentProps
  extends React.ComponentPropsWithoutRef<typeof SheetPrimitive.Content>,
    VariantProps<typeof sheetVariants> {}

const SheetContent = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Content>,
  SheetContentProps
>(({ side = "right", className, children, ...props }, ref) => (
  <SheetPortal>
    <SheetOverlay />
    <SheetPrimitive.Content ref={ref} className={cn(sheetVariants({ side }), className)} {...props}>
      <SheetPrimitive.Close className="absolute right-4 top-4 rounded-lg p-2 text-charcoal-400 hover:bg-charcoal-50 hover:text-charcoal-700 focus:outline-none focus:ring-2 focus:ring-primary-400">
        <X className="h-5 w-5" />
        <span className="sr-only">Close</span>
      </SheetPrimitive.Close>
      {children}
    </SheetPrimitive.Content>
  </SheetPortal>
));
SheetContent.displayName = "SheetContent";

const SheetHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("flex flex-col gap-1.5 p-6", className)} {...props} />
);
const SheetTitle = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Title>
>(({ className, ...props }, ref) => (
  <SheetPrimitive.Title ref={ref} className={cn("font-display text-xl font-semibold tracking-tight", className)} {...props} />
));
SheetTitle.displayName = "SheetTitle";

export { Sheet, SheetTrigger, SheetClose, SheetContent, SheetHeader, SheetTitle };
