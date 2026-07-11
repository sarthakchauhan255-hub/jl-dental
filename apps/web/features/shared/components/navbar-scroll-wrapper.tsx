"use client";
import { useState, useEffect } from "react";
import { usePathname }         from "next/navigation";
import { cn }                  from "@/lib/utils";

interface NavbarScrollWrapperProps {
  children: React.ReactNode;
  transparentOnHome?: boolean;
}

/**
 * Wraps the navbar to add scroll-aware background transition.
 * On homepage: transparent at top, solid white after scroll.
 * On all other pages: always solid (set immediately on mount).
 */
export function NavbarScrollWrapper({ children, transparentOnHome = true }: NavbarScrollWrapperProps) {
  const pathname = usePathname();
  const isHome   = pathname === "/";
  const [scrolled, setScrolled] = useState(!isHome || !transparentOnHome);

  useEffect(() => {
    if (!isHome || !transparentOnHome) { setScrolled(true); return; }
    setScrolled(window.scrollY > 60);
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [isHome, transparentOnHome]);

  const transparent = isHome && transparentOnHome && !scrolled;

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-sticky h-16 lg:h-20 transition-colors duration-250",
        transparent ? "bg-transparent" : "bg-white shadow-sm border-b border-charcoal-100/60"
      )}
      data-transparent={transparent}
    >
      {children}
    </header>
  );
}
