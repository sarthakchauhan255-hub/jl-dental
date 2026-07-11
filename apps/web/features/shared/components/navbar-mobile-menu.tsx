"use client";
import { useState, useEffect } from "react";
import Link              from "next/link";
import { usePathname }   from "next/navigation";
import { Menu, X }       from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { BrandLogo }     from "@/components/common/brand-logo";
import { cn }            from "@/lib/utils";

interface NavLink { label: string; href: string }

export function NavbarMobileMenu({ links, ctaHref, ctaLabel }: {
  links:    NavLink[];
  ctaHref:  string;
  ctaLabel: string;
}) {
  const [open, setOpen]   = useState(false);
  const pathname          = usePathname();

  useEffect(() => { setOpen(false); }, [pathname]);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button
          type="button"
          aria-label="Open menu"
          className="flex h-11 w-11 items-center justify-center rounded-lg text-charcoal-700 hover:bg-charcoal-50 lg:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400"
        >
          <Menu className="h-5 w-5" aria-hidden="true" />
        </button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full max-w-xs p-0">
        <div className="flex h-16 items-center justify-between border-b border-charcoal-100 px-5">
          <BrandLogo />
        </div>
        <nav aria-label="Mobile navigation" className="flex flex-col px-3 py-4">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "rounded-lg px-3 py-3.5 text-base font-medium text-charcoal-800",
                "hover:bg-primary-50 hover:text-primary-700 transition-colors",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="mt-auto border-t border-charcoal-100 p-5">
          <Link
            href={ctaHref}
            className="flex w-full items-center justify-center rounded-lg bg-primary-700 px-6 py-3.5 text-sm font-medium text-white hover:bg-primary-800 transition-colors"
          >
            {ctaLabel}
          </Link>
        </div>
      </SheetContent>
    </Sheet>
  );
}
