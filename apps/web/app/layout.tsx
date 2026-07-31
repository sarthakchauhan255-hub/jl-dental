import type { Metadata, Viewport } from "next";
import { Fraunces, Hanken_Grotesk } from "next/font/google";
import "./globals.css";
import { env } from "@/env";
import { getBrandAssets, BRAND } from "@/config/branding";

/**
 * Variable fonts sourced from @fontsource-variable.
 * next/font/local reads real font metrics → calculates size-adjust fallback → zero CLS.
 * Update fonts: see /public/fonts/README.md
 */
const hanken = Hanken_Grotesk({
  subsets:  ["latin"],
  variable: "--font-sans",
  display:  "swap",
  weight:   ["400", "500", "600"],
});

const fraunces = Fraunces({
  subsets:  ["latin"],
  variable: "--font-display",
  display:  "swap",
  weight:   ["400", "500", "600"],
  style:    ["normal", "italic"],
});

const brand = getBrandAssets();

export const metadata: Metadata = {
  icons: {
    icon: brand.favicon.svg,
  },
  metadataBase: new URL(env.NEXT_PUBLIC_APP_URL),
  title: {
    default:  BRAND.DEFAULT_TITLE,
    template: `%s${BRAND.TITLE_SUFFIX}`,
  },
  description: BRAND.DEFAULT_DESC,
  keywords: [
    "dentist in Solan", "dental clinic Solan", "best dentist Solan",
    "cosmetic dentist Solan", "dental care Himachal Pradesh",
  ],
  authors:  [{ name: BRAND.NAME }],
  creator:  BRAND.NAME,
  openGraph: {
    type: "website", locale: "en_IN",
    url:         env.NEXT_PUBLIC_APP_URL,
    siteName:    BRAND.NAME,
    title:       BRAND.DEFAULT_TITLE,
    description: BRAND.DEFAULT_DESC,
  },
  twitter: {
    card:        "summary_large_image",
    title:       BRAND.DEFAULT_TITLE,
    description: BRAND.DEFAULT_DESC,
  },
  robots: {
    index: true, follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
};

export const viewport: Viewport = {
  width: "device-width", initialScale: 1, maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: BRAND.THEME_COLOR_LIGHT },
    { media: "(prefers-color-scheme: dark)",  color: BRAND.THEME_COLOR_DARK },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${hanken.variable} ${fraunces.variable}`} suppressHydrationWarning>
      <body className="antialiased bg-background text-foreground font-sans">
        {children}
      </body>
    </html>
  );
}