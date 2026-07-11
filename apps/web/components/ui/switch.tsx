"use client";
/**
 * Switch — controlled boolean toggle, consistent with the CMS checkbox styling.
 * Accessible: real checkbox under the hood, keyboard + screen-reader native.
 */
import { cn } from "@/lib/utils";

interface SwitchProps {
  checked:         boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?:       boolean;
  "aria-label"?:   string;
  className?:      string;
}

export function Switch({ checked, onCheckedChange, disabled, className, ...aria }: SwitchProps) {
  return (
    <input
      type="checkbox"
      checked={checked}
      disabled={disabled}
      onChange={e => onCheckedChange(e.target.checked)}
      className={cn(
        "h-4 w-4 cursor-pointer rounded border-charcoal-300 text-primary-700 focus:ring-primary-400 disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...aria}
    />
  );
}
