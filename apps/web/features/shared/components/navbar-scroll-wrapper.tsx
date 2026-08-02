interface NavbarScrollWrapperProps {
  children: React.ReactNode;
  /** Retained for API compatibility — the navbar now uses a constant background. */
  transparentOnHome?: boolean;
}

/**
 * Fixed site header with a constant bone background on every page.
 * Previously it switched transparent→white on scroll (with a colour transition),
 * which caused a flash / logo pop on the homepage. Now it never changes.
 */
export function NavbarScrollWrapper({ children }: NavbarScrollWrapperProps) {
  return (
    <header className="fixed inset-x-0 top-0 z-sticky h-16 border-b border-border/60 bg-background lg:h-20">
      {children}
    </header>
  );
}
