"use client";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

interface ServicesDropdownProps {
  services: { name: string; slug: string }[];
  /** Transparent navbar context needs lighter text color */
  light?: boolean;
}

export function ServicesDropdown({ services, light = false }: ServicesDropdownProps) {
  if (services.length === 0) {
    return (
      <Link
        href="/services"
        className={light ? "text-white/90 hover:text-white" : "text-charcoal-700 hover:text-primary-700"}
      >
        Services
      </Link>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className={`inline-flex items-center gap-1 text-sm font-medium transition-colors focus-visible:outline-none ${light ? "text-white/90 hover:text-white" : "text-charcoal-700 hover:text-primary-700"}`}>
        Services
        <ChevronDown className="h-3.5 w-3.5" aria-hidden="true" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        {services.map((s) => (
          <DropdownMenuItem key={s.slug} asChild>
            <Link href={`/services/${s.slug}`}>{s.name}</Link>
          </DropdownMenuItem>
        ))}
        <DropdownMenuItem asChild>
          <Link href="/services" className="font-medium text-primary-700">View all services</Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
