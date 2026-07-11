# Favicon Generation

`icon.svg` is the source mark. Before production deployment, generate the full
favicon set from it (e.g. via https://realfavicongenerator.net or `sharp`):

- favicon.ico (16x16, 32x32, 48x48 multi-size)
- icon-192.png (PWA)
- icon-512.png (PWA)
- apple-touch-icon.png (180x180)

Replace via `config/branding.ts` `favicon` field — never hardcode paths in
`app/layout.tsx` or elsewhere.
