import * as React from "react";
import { cn } from "@/lib/utils";
import { Label } from "./label";

interface FormFieldProps {
  label:      string;
  htmlFor:    string;
  error?:     string;
  hint?:      string;
  required?:  boolean;
  className?: string;
  children:   React.ReactNode;
}

/**
 * Consistent form field wrapper — label + input + error message.
 * Use this instead of building label/error manually per field.
 */
export function FormField({
  label, htmlFor, error, hint, required, className, children,
}: FormFieldProps) {
  const errorId = error ? `${htmlFor}-error` : undefined;
  const hintId  = hint  ? `${htmlFor}-hint`  : undefined;

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <Label htmlFor={htmlFor} required={required}>
        {label}
      </Label>

      {hint && (
        <p id={hintId} className="text-xs text-muted-foreground -mt-1">
          {hint}
        </p>
      )}

      {/* Clone children to inject aria-describedby and error prop */}
      {React.Children.map(children, (child) => {
        if (!React.isValidElement(child)) return child;
        return React.cloneElement(child as React.ReactElement<{
          id?: string;
          "aria-describedby"?: string;
          "aria-invalid"?: boolean;
          error?: boolean;
        }>, {
          id:                 htmlFor,
          "aria-describedby": [errorId, hintId].filter(Boolean).join(" ") || undefined,
          "aria-invalid":     !!error,
          error:              !!error,
        });
      })}

      {error && (
        <p id={errorId} role="alert" className="flex items-center gap-1.5 text-xs text-destructive">
          <span aria-hidden="true">⚠</span>
          {error}
        </p>
      )}
    </div>
  );
}
