import { cn } from "@/lib/utils";

interface SectionCardProps {
  title?:       string;
  description?: string;
  children:     React.ReactNode;
  className?:   string;
  actions?:     React.ReactNode;
}

/** Reusable card wrapper for CMS form sections / content blocks. */
export function SectionCard({ title, description, children, className, actions }: SectionCardProps) {
  return (
    <div className={cn("rounded-xl border border-border bg-white", className)}>
      {(title || actions) && (
        <div className="flex items-start justify-between gap-3 border-b border-border px-5 py-4">
          <div>
            {title && <p className="text-sm font-medium text-charcoal-900">{title}</p>}
            {description && <p className="mt-0.5 text-xs text-charcoal-500">{description}</p>}
          </div>
          {actions && <div className="flex-shrink-0">{actions}</div>}
        </div>
      )}
      <div className="p-5">{children}</div>
    </div>
  );
}
