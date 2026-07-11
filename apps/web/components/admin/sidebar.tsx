"use client";
import { useState }    from "react";
import Link            from "next/link";
import { usePathname } from "next/navigation";
import { Menu }        from "lucide-react";
import { cn }          from "@/lib/utils";
import { ADMIN_NAV_LINKS } from "@/lib/constants/app";
import { NAV_ICONS }   from "./nav-icons";
import { getBrandAssets } from "@/config/branding";
import { Sheet, SheetContent } from "@/components/ui/sheet";

export function AdminSidebar() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        aria-label="Open navigation"
        onClick={() => setOpen(true)}
        className="fixed left-4 top-4 z-sticky lg:hidden p-2 rounded-lg bg-charcoal-900 text-white"
      >
        <Menu className="h-5 w-5" />
      </button>

      <aside className="hidden lg:flex lg:flex-col lg:w-60 lg:fixed lg:inset-y-0 lg:z-sticky">
        <Nav />
      </aside>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="left" className="w-60 p-0 bg-charcoal-900 border-charcoal-800">
          <Nav onNavClick={() => setOpen(false)} />
        </SheetContent>
      </Sheet>
    </>
  );
}

function Nav({ onNavClick }: { onNavClick?: () => void }) {
  const pathname = usePathname();
  return (
    <div className="flex h-full flex-col bg-charcoal-900">
      <div className="flex h-16 items-center gap-2.5 px-5 border-b border-charcoal-800">
        <div className="h-7 w-7 rounded-lg bg-primary-600 flex items-center justify-center flex-shrink-0">
          <span className="text-white text-xs font-bold">{getBrandAssets().monogram}</span>
        </div>
        <div>
          <p className="text-white text-sm font-semibold leading-tight">{getBrandAssets().shortName}</p>
          <p className="text-charcoal-400 text-xs">Admin</p>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto py-4 px-3" aria-label="Admin navigation">
        <ul className="space-y-0.5" role="list">
          {ADMIN_NAV_LINKS.map((link) => {
            const active = link.href === "/admin/dashboard"
              ? pathname === link.href
              : pathname.startsWith(link.href);
            const Icon = NAV_ICONS[link.icon as keyof typeof NAV_ICONS];
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={onNavClick}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400",
                    active
                      ? "bg-primary-700 text-white font-medium"
                      : "text-charcoal-300 hover:bg-charcoal-800 hover:text-white"
                  )}
                >
                  {Icon && <Icon className="h-4 w-4 flex-shrink-0" aria-hidden="true" />}
                  {link.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="border-t border-charcoal-800 px-3 py-3">
        <Link
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-3 py-2 text-xs text-charcoal-400 hover:text-white rounded-lg hover:bg-charcoal-800 transition-colors"
        >
          View website ↗
        </Link>
      </div>
    </div>
  );
}
