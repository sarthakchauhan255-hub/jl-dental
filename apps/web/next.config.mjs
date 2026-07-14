/** @type {import('next').NextConfig} */
const nextConfig = {
  // ─── Image Optimization ────────────────────────────────────────────────
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
    ],
    formats: ["image/avif", "image/webp"],
    deviceSizes: [375, 640, 768, 1024, 1280, 1440, 1920],
    imageSizes: [16, 32, 64, 96, 128, 256],
  },

  // ─── Security Headers ──────────────────────────────────────────────────
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "Content-Security-Policy",    value: "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https://res.cloudinary.com; font-src 'self' data:; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'; object-src 'none'; upgrade-insecure-requests" },
          { key: "Strict-Transport-Security",   value: "max-age=63072000; includeSubDomains; preload" },
          { key: "X-Frame-Options",           value: "DENY" },
          { key: "X-Content-Type-Options",     value: "nosniff" },
          { key: "Referrer-Policy",            value: "strict-origin-when-cross-origin" },
          { key: "X-XSS-Protection",           value: "1; mode=block" },
          { key: "Permissions-Policy",         value: "camera=(), microphone=(), geolocation=(self)" },
        ],
      },
    ];
  },

  // ─── Redirects ─────────────────────────────────────────────────────────
  async redirects() {
    return [
      // Bare /admin and /login → the login page (dashboard requires auth,
      // so sending unauthenticated users to /admin/dashboard caused a loop)
      {
        source: "/admin",
        destination: "/admin/login",
        permanent: false,
      },
      {
        source: "/login",
        destination: "/admin/login",
        permanent: false,
      },
    ];
  },

  // ─── Logging ──────────────────────────────────────────────────────────
  logging: {
    fetches: { fullUrl: process.env.NODE_ENV === "development" },
  },

  // ─── TypeScript + ESLint ──────────────────────────────────────────────
  typescript:  { ignoreBuildErrors: false },
  eslint:      { ignoreDuringBuilds: false },
};

export default nextConfig;
