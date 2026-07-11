"use client";
import { MessageCircle } from "lucide-react";
import { usePathname }   from "next/navigation";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { BRAND } from "@/config/branding";

interface WhatsAppButtonProps {
  phone:   string;
  message?: string;
}

/**
 * Floating WhatsApp CTA. Hidden on /book to avoid distracting during booking.
 * Subtle entrance after a short delay per motion discipline (no jarring pop-in).
 */
export function WhatsAppButton({ phone, message = BRAND.WHATSAPP_MSG }: WhatsAppButtonProps) {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 1200);
    return () => clearTimeout(t);
  }, []);

  if (pathname === "/book" || !phone) return null;

  const href = `https://wa.me/${phone.replace(/[^\d]/g, "")}?text=${encodeURIComponent(message)}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      className={cn(
        "fixed bottom-6 right-6 z-sticky flex h-14 w-14 items-center justify-center rounded-full",
        "bg-[#25D366] text-white shadow-lg transition-all duration-350 ease-out-expo",
        "hover:scale-105 hover:shadow-xl",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25D366] focus-visible:ring-offset-2",
        visible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0 pointer-events-none"
      )}
    >
      <MessageCircle className="h-6 w-6" aria-hidden="true" fill="white" />
    </a>
  );
}
