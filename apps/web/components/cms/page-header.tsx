import { type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title:       string;
  description?: string;
  icon?:       LucideIcon;
  actions?:    React.ReactNode;
  breadcrumb?: React.ReactNode;
  className?:  string;
}

/**
 * Reusable CMS page header.
 * Every admin page uses this — consistent title + action slot layout.
 */
export function PageHeader({
  title, description, icon: Icon, actions, breadcrumb, className,
}: PageHeaderProps) {
  return (
    <div className={cn("mb-6", className)}>
      {breadcrumb && <div className="mb-3">{breadcrumb}</div>}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          {Icon && (
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-primary-50">
              <Icon className="h-5 w-5 text-primary-700" aria-hidden="true" />
            </div>
          )}
          <div className="min-w-0">
            <h1 className="text-xl font-semibold text-charcoal-900 truncate">{title}</h1>
            {description && (
              <p className="mt-0.5 text-sm text-charcoal-500">{description}</p>
            )}
          </div>
        </div>
        {actions && (
          <div className="flex items-center gap-2 flex-shrink-0">{actions}</div>
        )}
      </div>
    </div>
  );
}
