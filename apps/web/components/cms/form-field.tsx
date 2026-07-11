import { type ReactNode } from "react";
import { Label }  from "@/components/ui/label";
import { cn }     from "@/lib/utils";

interface FormFieldProps {
  id:           string;
  label:        string;
  required?:    boolean;
  error?:       string;
  hint?:        string;
  children:     ReactNode;
  className?:   string;
}

/** Wraps any input with consistent label + error + hint. */
export function FormField({
  id, label, required, error, hint, children, className,
}: FormFieldProps) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <Label htmlFor={id} className={cn(required && "after:content-['*'] after:ml-0.5 after:text-destructive")}>
        {label}
      </Label>
      {children}
      {error ? (
        <p id={`${id}-error`} role="alert" className="text-xs text-destructive">{error}</p>
      ) : hint ? (
        <p id={`${id}-hint`} className="text-xs text-charcoal-400">{hint}</p>
      ) : null}
    </div>
  );
}
