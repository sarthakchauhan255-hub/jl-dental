import { cn } from "@/lib/utils";

interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  as?:       "section" | "div" | "article" | "aside";
  size?:     "sm" | "md" | "lg";
  bg?:       "white" | "muted" | "primary" | "dark";
  contained?: boolean;
}

/**
 * Section wrapper — consistent vertical padding + optional container.
 * Use this for all page sections to enforce spacing consistency.
 */
export function Section({
  as: As = "section",
  size = "md",
  bg = "white",
  contained = true,
  className,
  children,
  ...props
}: SectionProps) {
  const padding = {
    sm: "py-10 md:py-16 lg:py-20",
    md: "py-16 md:py-24 lg:py-32",
    lg: "py-20 md:py-28 lg:py-40",
  }[size];

  const background = {
    white:   "bg-white",
    muted:   "bg-muted/50",
    primary: "bg-primary-50",
    dark:    "bg-charcoal-900 text-white",
  }[bg];

  return (
    <As className={cn(padding, background, className)} {...props}>
      {contained ? (
        <div className="container-base">{children}</div>
      ) : (
        children
      )}
    </As>
  );
}

/** Section header — luxury label + heading + subtitle pattern */
interface SectionHeaderProps {
  label?:     string;
  heading:    string;
  subtext?:   string;
  align?:     "left" | "center";
  className?: string;
  /** Heading level for semantic HTML — defaults to h2 */
  level?:     2 | 3;
}

export function SectionHeader({
  label,
  heading,
  subtext,
  align = "center",
  className,
  level = 2,
}: SectionHeaderProps) {
  const HeadingTag = `h${level}` as "h2" | "h3";
  const alignClass = align === "center" ? "text-center items-center" : "text-left items-start";

  return (
    <div className={cn("flex flex-col gap-3 mb-12 md:mb-16", alignClass, className)}>
      {label && (
        <span className="label-luxury" aria-label={label}>
          {label}
        </span>
      )}
      <HeadingTag className="heading-2 balance max-w-2xl">
        {heading}
      </HeadingTag>
      {subtext && (
        <p className="body-lg text-muted-foreground max-w-xl balance">
          {subtext}
        </p>
      )}
      <div className="divider-luxury mt-1" aria-hidden="true" />
    </div>
  );
}
