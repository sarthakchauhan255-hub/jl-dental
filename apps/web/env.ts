import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    // ─── Database ─────────────────────────────────────────────────────────
    MONGODB_URI: z.string().url(),

    // ─── Auth ─────────────────────────────────────────────────────────────
    JWT_SECRET: z.string().min(32, "JWT_SECRET must be at least 32 characters"),
    JWT_EXPIRY:  z.string().default("7d"),

    // ─── Cloudinary ───────────────────────────────────────────────────────
    CLOUDINARY_CLOUD_NAME: z.string().min(1),
    CLOUDINARY_API_KEY:    z.string().min(1),
    CLOUDINARY_API_SECRET: z.string().min(1),

    // ─── Email ────────────────────────────────────────────────────────────
    RESEND_API_KEY: z.string().min(1),
    EMAIL_FROM:     z.string().email().default("hello@jldental.com"),

    // ─── Upstash Redis (rate limiting) ────────────────────────────────────
    UPSTASH_REDIS_REST_URL:   z.string().url(),
    UPSTASH_REDIS_REST_TOKEN: z.string().min(1),

    // ─── Cron protection ─────────────────────────────────────────────────
    CRON_SECRET: z.string().min(16),

    // ─── WhatsApp / Twilio (optional v1 — stub-ready) ────────────────────
    TWILIO_ACCOUNT_SID:    z.string().optional(),
    TWILIO_AUTH_TOKEN:     z.string().optional(),
    TWILIO_WHATSAPP_FROM:  z.string().optional(),

    // ─── Runtime ──────────────────────────────────────────────────────────
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  },

  client: {
    NEXT_PUBLIC_APP_URL:               z.string().url(),
    NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME: z.string().min(1),
  },

  runtimeEnv: {
    MONGODB_URI:                       process.env.MONGODB_URI,
    JWT_SECRET:                        process.env.JWT_SECRET,
    JWT_EXPIRY:                        process.env.JWT_EXPIRY,
    CLOUDINARY_CLOUD_NAME:             process.env.CLOUDINARY_CLOUD_NAME,
    CLOUDINARY_API_KEY:                process.env.CLOUDINARY_API_KEY,
    CLOUDINARY_API_SECRET:             process.env.CLOUDINARY_API_SECRET,
    RESEND_API_KEY:                    process.env.RESEND_API_KEY,
    EMAIL_FROM:                        process.env.EMAIL_FROM,
    UPSTASH_REDIS_REST_URL:            process.env.UPSTASH_REDIS_REST_URL,
    UPSTASH_REDIS_REST_TOKEN:          process.env.UPSTASH_REDIS_REST_TOKEN,
    CRON_SECRET:                       process.env.CRON_SECRET,
    TWILIO_ACCOUNT_SID:                process.env.TWILIO_ACCOUNT_SID,
    TWILIO_AUTH_TOKEN:                 process.env.TWILIO_AUTH_TOKEN,
    TWILIO_WHATSAPP_FROM:              process.env.TWILIO_WHATSAPP_FROM,
    NODE_ENV:                          process.env.NODE_ENV,
    NEXT_PUBLIC_APP_URL:               process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  },

  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
});
