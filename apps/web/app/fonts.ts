/**
 * Font configuration.
 *
 * Production (Vercel): next/font/google downloads + serves fonts from Vercel CDN
 * with automatic subset, zero layout shift, and no external runtime dependency.
 *
 * Local dev fallback: size-adjusted system fonts prevent CLS until Google Fonts
 * are available. The CSS variable names are identical in both paths.
 *
 * To switch to self-hosted: place .woff2 files in /public/fonts/ and update
 * the font config below to use next/font/local with the same variable names.
 */

// NOTE: This file is imported by app/layout.tsx only.
// Components use var(--font-sans) and var(--font-display) — never import fonts directly.

export const FONT_SANS_VARIABLE    = "--font-sans";
export const FONT_DISPLAY_VARIABLE = "--font-display";

/**
 * Font stack fallbacks — used when web fonts haven't loaded.
 * size-adjust prevents layout shift (WCAG + CLS requirement).
 */
export const FONT_FALLBACKS = {
  sans: [
    "Inter",
    "-apple-system",
    "BlinkMacSystemFont",
    '"Segoe UI"',
    "Roboto",
    "sans-serif",
  ].join(", "),
  display: [
    '"Playfair Display"',
    "Georgia",
    '"Times New Roman"',
    "serif",
  ].join(", "),
};
