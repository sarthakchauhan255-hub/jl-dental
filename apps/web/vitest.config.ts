import { defineConfig } from "vitest/config";
import react           from "@vitejs/plugin-react";
import path            from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment:  "node",
    globals:      true,
    setupFiles:   ["./vitest.setup.ts"],
    env: {
      MONGODB_URI:               "mongodb://localhost:27017/test",
      JWT_SECRET:                "test-jwt-secret-at-least-32-chars-long",
      JWT_EXPIRY:                "7d",
      CLOUDINARY_CLOUD_NAME:     "test-cloud",
      CLOUDINARY_API_KEY:        "test-key",
      CLOUDINARY_API_SECRET:     "test-secret",
      RESEND_API_KEY:            "re_test_key",
      EMAIL_FROM:                "test@jldental.com",
      UPSTASH_REDIS_REST_URL:    "https://test.upstash.io",
      UPSTASH_REDIS_REST_TOKEN:  "test-token",
      CRON_SECRET:               "test-cron-secret-16chars",
      NEXT_PUBLIC_SITE_URL:      "http://localhost:3000",
      NODE_ENV:                  "test",
      SKIP_ENV_VALIDATION:       "1",
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
    },
  },
});
