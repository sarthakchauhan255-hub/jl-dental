/**
 * Logger abstraction.
 *
 * - Development: formatted console output with color
 * - Production: structured JSON (Vercel-compatible, Sentry-ready)
 * - Never call console.* directly in business logic — use this
 *
 * Future: swap implementation to Pino or integrate Sentry without
 * touching any call sites.
 */
import { BRAND } from "@/config/branding";
import { TECH } from "@/config/technical";
import { env } from "@/env";


type LogLevel = "debug" | "info" | "warn" | "error";
type LogMeta  = Record<string, unknown>;


// ─── Log sanitization ────────────────────────────────────────────────────────
const SENSITIVE_KEYS = new Set([
  "password", "passwordHash", "token", "tokenHash", "secret",
  "cookie", "authorization", "resetToken", "rawToken", "jwt",
]);

function sanitizeMeta(meta: LogMeta): LogMeta {
  return Object.fromEntries(
    Object.entries(meta).map(([k, v]) => [
      k,
      SENSITIVE_KEYS.has(k.toLowerCase()) ? "[REDACTED]" : v,
    ])
  );
}

const isDev  = env.NODE_ENV === "development";
const isProd = env.NODE_ENV === "production";

// ─── Formatters ───────────────────────────────────────────────────────────────
function formatDev(level: LogLevel, message: string, meta?: LogMeta): void {
  const prefix = {
    debug: "\x1b[36m[DEBUG]\x1b[0m",
    info:  "\x1b[32m[INFO]\x1b[0m ",
    warn:  "\x1b[33m[WARN]\x1b[0m ",
    error: "\x1b[31m[ERROR]\x1b[0m",
  }[level];

  const timestamp = new Date().toISOString().slice(11, 23); // HH:MM:SS.mmm
  const metaStr   = meta ? ` ${JSON.stringify(meta)}` : "";

  if (level === "error") {
    console.error(`${timestamp} ${prefix} ${message}${metaStr}`);
  } else if (level === "warn") {
    console.warn(`${timestamp} ${prefix} ${message}${metaStr}`);
  } else {
    console.log(`${timestamp} ${prefix} ${message}${metaStr}`);
  }
}

function formatProd(level: LogLevel, message: string, meta?: LogMeta): void {
  // Structured JSON — parsed by Vercel log drains, Datadog, etc.
  const entry = JSON.stringify({
    timestamp: new Date().toISOString(),
    level,
    message,
    ...(meta ? { meta } : {}),
    service: TECH.LOGGER_SERVICE_NAME,
  });

  if (level === "error") {
    console.error(entry);
  } else if (level === "warn") {
    console.warn(entry);
  } else {
    console.log(entry);
  }
}

function log(level: LogLevel, message: string, meta?: LogMeta): void {
  // Skip debug logs in production
  if (isProd && level === "debug") return;

  const safeMeta = meta ? sanitizeMeta(meta) : undefined;
  if (isDev) {
    formatDev(level, message, safeMeta);
  } else {
    formatProd(level, message, safeMeta);
  }
}

// ─── Public API ───────────────────────────────────────────────────────────────
export const logger = {
  debug: (message: string, meta?: LogMeta) => log("debug", message, meta),
  info:  (message: string, meta?: LogMeta) => log("info",  message, meta),
  warn:  (message: string, meta?: LogMeta) => log("warn",  message, meta),
  error: (message: string, meta?: LogMeta) => log("error", message, meta),

  /**
   * Log an external service call result (email, Cloudinary, etc.)
   * Standardized so all service interactions look the same in logs.
   */
  service: (
    service: string,
    action:  string,
    result:  "success" | "failure",
    meta?:   LogMeta
  ) => {
    const level = result === "failure" ? "error" : "info";
    log(level, `[${service}] ${action} — ${result}`, meta);
  },
} as const;
