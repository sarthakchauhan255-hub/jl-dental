# Self-Hosted Fonts

Fonts are served from this directory via `next/font/local`.
Source: `@fontsource-variable` npm packages (real woff2 binaries).

## Current fonts

| File | Family | Axis | Use |
|---|---|---|---|
| `inter-var.woff2` | Inter | wght 100–900 | Body, UI, labels |
| `playfair-var.woff2` | Playfair Display | wght 400–900, normal | Headings, display |
| `playfair-var-italic.woff2` | Playfair Display | wght 400–900, italic | Pull quotes, accents |

## Updating fonts

```bash
cd apps/web
npm install @fontsource-variable/inter@latest @fontsource-variable/playfair-display@latest

cp node_modules/@fontsource-variable/inter/files/inter-latin-standard-normal.woff2 \
   public/fonts/inter-var.woff2

cp node_modules/@fontsource-variable/playfair-display/files/playfair-display-latin-wght-normal.woff2 \
   public/fonts/playfair-var.woff2

# Find italic file:
ls node_modules/@fontsource-variable/playfair-display/files/ | grep latin.*italic
# Copy the wght-italic variant:
cp node_modules/@fontsource-variable/playfair-display/files/playfair-display-latin-wght-italic.woff2 \
   public/fonts/playfair-var-italic.woff2
```

## Why variable fonts?

- One file covers all weights (300–700) — fewer HTTP requests
- Smaller combined size than separate weight files
- next/font reads real font metrics → `adjustFontFallback` prevents CLS
- Served from Vercel CDN alongside the app — zero external dependency
