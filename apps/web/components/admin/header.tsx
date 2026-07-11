"use client";
import { useCallback, useState } from "react";
import { usePathname }           from "next/navigation";
import { RefreshCw, ChevronDown, LogOut, User } from "lucide-react";
import { cn }                    from "@/lib/utils";
import { useAuth }               from "@/context/auth-context";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function AdminHeader() {
  const { user, logout }            = useAuth();
  const pathname                    = usePathname();
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    window.location.reload();
  }, []);

  const title = pathname
    .replace("/admin", "")
    .split("/")
    .filter(Boolean)
    .map((s) => s.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()))
    .join(" / ") || "Dashboard";

  return (
    <header className="sticky top-0 z-sticky flex h-16 items-center gap-4 border-b border-border bg-white px-4 md:px-6">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:z-toast
                   focus:rounded-lg focus:bg-primary-700 focus:px-4 focus:py-2 focus:text-white focus:text-sm"
      >
        Skip to main content
      </a>

      <div className="w-10 lg:hidden" aria-hidden="true" />

      <h1 className="flex-1 text-base font-semibold text-charcoal-900 truncate">{title}</h1>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={handleRefresh}
          aria-label="Refresh"
          disabled={refreshing}
          className={cn(
            "flex h-9 w-9 items-center justify-center rounded-lg text-charcoal-500",
            "hover:bg-charcoal-100 hover:text-charcoal-700 transition-colors",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400",
            "disabled:opacity-50"
          )}
        >
          <RefreshCw className={cn("h-4 w-4", refreshing && "animate-spin")} aria-hidden="true" />
        </button>

        <DropdownMenu>
          <DropdownMenuTrigger className={cn(
            "flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-charcoal-700",
            "hover:bg-charcoal-100 transition-colors",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400"
          )}>
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary-100 text-primary-700 flex-shrink-0">
              <span className="text-xs font-semibold">{user?.name?.charAt(0).toUpperCase() ?? "A"}</span>
            </div>
            <span className="hidden md:block max-w-[120px] truncate">{user?.name ?? "Admin"}</span>
            <ChevronDown className="h-3.5 w-3.5 text-charcoal-400" aria-hidden="true" />
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel className="font-normal">
              <p className="text-sm font-medium">{user?.name}</p>
              <p className="text-xs text-muted-foreground capitalize">{user?.role?.replace("_", " ")}</p>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <a href="/admin/settings" className="cursor-pointer">
                <User className="mr-2 h-4 w-4" aria-hidden="true" />
                Account settings
              </a>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={logout} destructive className="cursor-pointer">
              <LogOut className="mr-2 h-4 w-4" aria-hidden="true" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
