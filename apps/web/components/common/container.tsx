import { cn } from "@/lib/utils";

interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "narrow" | "default" | "wide";
}

/**
 * Responsive container with correct max-widths and padding.
 * Use this instead of inline container-base classes for clarity.
 */
export function Container({
  size = "default",
  className,
  ...props
}: ContainerProps) {
  return (
    <div
      className={cn(
        size === "narrow"  && "container-narrow",
        size === "default" && "container-base",
        size === "wide"    && "container-wide",
        className
      )}
      {...props}
    />
  );
}
