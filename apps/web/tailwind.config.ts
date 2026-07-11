import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    // ─── Breakpoints (mobile-first) ───────────────────────────────────────
    screens: {
      xs: "375px",
      sm: "640px",
      md: "768px",
      lg: "1024px",
      xl: "1280px",
      "2xl": "1440px",
    },
    extend: {
      // ─── Brand Color System ─────────────────────────────────────────────
      colors: {
        // Semantic tokens — mapped to CSS variables in globals.css
        background:     "hsl(var(--background))",
        foreground:     "hsl(var(--foreground))",
        primary: {
          DEFAULT:      "hsl(var(--primary))",
          foreground:   "hsl(var(--primary-foreground))",
          50:           "hsl(var(--primary-50))",
          100:          "hsl(var(--primary-100))",
          200:          "hsl(var(--primary-200))",
          300:          "hsl(var(--primary-300))",
          400:          "hsl(var(--primary-400))",
          500:          "hsl(var(--primary-500))",
          600:          "hsl(var(--primary-600))",
          700:          "hsl(var(--primary-700))",
          800:          "hsl(var(--primary-800))",
          900:          "hsl(var(--primary-900))",
        },
        secondary: {
          DEFAULT:      "hsl(var(--secondary))",
          foreground:   "hsl(var(--secondary-foreground))",
        },
        accent: {
          DEFAULT:      "hsl(var(--accent))",
          foreground:   "hsl(var(--accent-foreground))",
          gold:         "hsl(var(--accent-gold))",
        },
        muted: {
          DEFAULT:      "hsl(var(--muted))",
          foreground:   "hsl(var(--muted-foreground))",
        },
        card: {
          DEFAULT:      "hsl(var(--card))",
          foreground:   "hsl(var(--card-foreground))",
        },
        border:         "hsl(var(--border))",
        input:          "hsl(var(--input))",
        ring:           "hsl(var(--ring))",
        // Status colors
        destructive: {
          DEFAULT:      "hsl(var(--destructive))",
          foreground:   "hsl(var(--destructive-foreground))",
        },
        success: {
          DEFAULT:      "hsl(var(--success))",
          foreground:   "hsl(var(--success-foreground))",
        },
        warning: {
          DEFAULT:      "hsl(var(--warning))",
          foreground:   "hsl(var(--warning-foreground))",
        },
        // Brand-specific neutrals
        charcoal: {
          50:  "#f7f7f7",
          100: "#e3e3e3",
          200: "#c8c8c8",
          300: "#a4a4a4",
          400: "#818181",
          500: "#666666",
          600: "#515151",
          700: "#434343",
          800: "#383838",
          900: "#1a1a1a",
          950: "#0d0d0d",
        },
      },

      // ─── Typography ─────────────────────────────────────────────────────
      fontFamily: {
        sans:    ["var(--font-sans)", "system-ui", "sans-serif"],
        serif:   ["var(--font-serif)", "Georgia", "serif"],
        display: ["var(--font-display)", "var(--font-serif)", "serif"],
        mono:    ["var(--font-mono)", "monospace"],
      },
      fontSize: {
        "2xs": ["0.625rem",  { lineHeight: "0.875rem" }],
        xs:    ["0.75rem",   { lineHeight: "1.125rem" }],
        sm:    ["0.875rem",  { lineHeight: "1.375rem" }],
        base:  ["1rem",      { lineHeight: "1.625rem" }],
        lg:    ["1.125rem",  { lineHeight: "1.75rem"  }],
        xl:    ["1.25rem",   { lineHeight: "1.875rem" }],
        "2xl": ["1.5rem",    { lineHeight: "2rem"     }],
        "3xl": ["1.875rem",  { lineHeight: "2.375rem" }],
        "4xl": ["2.25rem",   { lineHeight: "2.75rem"  }],
        "5xl": ["3rem",      { lineHeight: "3.5rem",  letterSpacing: "-0.02em" }],
        "6xl": ["3.75rem",   { lineHeight: "4.25rem", letterSpacing: "-0.02em" }],
        "7xl": ["4.5rem",    { lineHeight: "5rem",    letterSpacing: "-0.03em" }],
        "8xl": ["6rem",      { lineHeight: "6.5rem",  letterSpacing: "-0.04em" }],
      },
      letterSpacing: {
        tightest: "-0.04em",
        tighter:  "-0.02em",
        tight:    "-0.01em",
        normal:   "0em",
        wide:     "0.025em",
        wider:    "0.05em",
        widest:   "0.1em",
        luxury:   "0.15em",
      },
      lineHeight: {
        tight:    "1.2",
        snug:     "1.375",
        normal:   "1.5",
        relaxed:  "1.625",
        loose:    "2",
      },

      // ─── Spacing & Layout ────────────────────────────────────────────────
      spacing: {
        "4.5":  "1.125rem",
        "13":   "3.25rem",
        "15":   "3.75rem",
        "18":   "4.5rem",
        "22":   "5.5rem",
        "26":   "6.5rem",
        "30":   "7.5rem",
        "34":   "8.5rem",
        "section-sm":  "4rem",
        "section":     "6rem",
        "section-lg":  "8rem",
        "section-xl": "10rem",
      },
      maxWidth: {
        "8xl":  "88rem",
        "9xl":  "96rem",
        "prose-lg": "72ch",
      },
      borderRadius: {
        "none":  "0",
        "xs":    "0.125rem",
        "sm":    "0.25rem",
        DEFAULT: "0.375rem",
        "md":    "0.5rem",
        "lg":    "0.75rem",
        "xl":    "1rem",
        "2xl":   "1.25rem",
        "3xl":   "1.5rem",
        "4xl":   "2rem",
        "full":  "9999px",
      },

      // ─── Shadows (luxury soft feel) ─────────────────────────────────────
      boxShadow: {
        "xs":      "0 1px 2px 0 rgb(0 0 0 / 0.04)",
        "sm":      "0 1px 3px 0 rgb(0 0 0 / 0.06), 0 1px 2px -1px rgb(0 0 0 / 0.04)",
        DEFAULT:   "0 4px 6px -1px rgb(0 0 0 / 0.06), 0 2px 4px -2px rgb(0 0 0 / 0.04)",
        "md":      "0 6px 16px -2px rgb(0 0 0 / 0.08), 0 3px 6px -3px rgb(0 0 0 / 0.04)",
        "lg":      "0 12px 28px -4px rgb(0 0 0 / 0.1), 0 6px 12px -4px rgb(0 0 0 / 0.05)",
        "xl":      "0 20px 48px -8px rgb(0 0 0 / 0.12), 0 10px 20px -6px rgb(0 0 0 / 0.06)",
        "2xl":     "0 32px 64px -12px rgb(0 0 0 / 0.16)",
        "luxury":  "0 8px 32px -4px rgb(0 0 0 / 0.08), 0 2px 8px -2px rgb(0 0 0 / 0.04)",
        "card":    "0 2px 12px 0 rgb(0 0 0 / 0.06), 0 1px 4px 0 rgb(0 0 0 / 0.03)",
        "inner":   "inset 0 2px 4px 0 rgb(0 0 0 / 0.04)",
        "none":    "none",
      },

      // ─── Transitions & Animation ─────────────────────────────────────────
      transitionDuration: {
        "150": "150ms",
        "250": "250ms",
        "350": "350ms",
        "400": "400ms",
        "500": "500ms",
        "700": "700ms",
      },
      transitionTimingFunction: {
        "luxury":  "cubic-bezier(0.4, 0, 0.2, 1)",
        "spring":  "cubic-bezier(0.34, 1.56, 0.64, 1)",
        "smooth":  "cubic-bezier(0.25, 0.1, 0.25, 1)",
        "ease-in-expo": "cubic-bezier(0.7, 0, 0.84, 0)",
        "ease-out-expo": "cubic-bezier(0.16, 1, 0.3, 1)",
      },
      keyframes: {
        "fade-in": {
          "0%":   { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "fade-up": {
          "0%":   { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-down": {
          "0%":   { opacity: "0", transform: "translateY(-16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "slide-in-left": {
          "0%":   { opacity: "0", transform: "translateX(-24px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        "scale-in": {
          "0%":   { opacity: "0", transform: "scale(0.95)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        shimmer: {
          "0%":   { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      animation: {
        "fade-in":       "fade-in 0.4s ease-out-expo forwards",
        "fade-up":       "fade-up 0.5s ease-out-expo forwards",
        "fade-down":     "fade-down 0.4s ease-out-expo forwards",
        "slide-in-left": "slide-in-left 0.4s ease-out-expo forwards",
        "scale-in":      "scale-in 0.3s ease-out-expo forwards",
        shimmer:         "shimmer 2s linear infinite",
      },

      // ─── Z-Index Scale ───────────────────────────────────────────────────
      zIndex: {
        "behind":  "-1",
        "base":    "0",
        "raised":  "10",
        "dropdown":"100",
        "sticky":  "200",
        "overlay": "300",
        "modal":   "400",
        "toast":   "500",
      },
    },
  },
  plugins: [],
};

export default config;
