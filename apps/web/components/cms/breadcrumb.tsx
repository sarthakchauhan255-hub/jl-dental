import Link from "next/link";
import { ChevronRight } from "lucide-react";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export function CmsBreadcrumb({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex items-center gap-1 text-xs text-charcoal-500">
        {items.map((item, idx) => (
          <li key={idx} className="flex items-center gap-1">
            {idx > 0 && <ChevronRight className="h-3 w-3 flex-shrink-0" aria-hidden="true" />}
            {item.href && idx < items.length - 1 ? (
              <Link href={item.href} className="hover:text-charcoal-700 transition-colors">
                {item.label}
              </Link>
            ) : (
              <span className={idx === items.length - 1 ? "text-charcoal-700 font-medium" : ""}>
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
