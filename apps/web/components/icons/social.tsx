/** Minimal social brand marks — lucide-react v1 removed these for licensing reasons. */
export function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className} aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="3.5" />
      <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" />
    </svg>
  );
}

export function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className} aria-hidden="true">
      <path d="M14 9h2V6h-2c-1.66 0-3 1.34-3 3v2H9v3h2v6h3v-6h2.2l.8-3H14V9z" />
    </svg>
  );
}

export function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M12 3a9 9 0 00-7.74 13.6L3 21l4.5-1.2A9 9 0 1012 3z" />
      <path d="M9 8.4c.4 2.9 2.6 5.2 5.6 5.6l1-1.5-2-.8-.7.7c-1-.4-1.7-1.1-2.1-2.1l.7-.7-.8-2L9 8.4z" />
    </svg>
  );
}

export function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M21 12c0 5-3.6 8.5-9 8.5a8.5 8.5 0 110-17c2.3 0 4.3.85 5.8 2.25l-2.6 2.55A5 5 0 1017 13.2H12" />
    </svg>
  );
}
