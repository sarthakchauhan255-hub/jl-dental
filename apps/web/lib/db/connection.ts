/**
 * MongoDB connection — singleton pattern for serverless.
 *
 * Problem: Next.js API routes are serverless functions. Each cold start
 * creates a new connection. Without caching, this exhausts Atlas connection limits.
 *
 * Solution: Cache the connection promise in the global object (persists
 * across hot reloads in development and across invocations in the same
 * serverless container in production).
 */
import mongoose from "mongoose";
import { logger } from "@/lib/logger";
import { env } from "@/env";
import { BRAND } from "@/config/branding";

const MONGODB_URI = env.MONGODB_URI;



// ─── Connection cache ─────────────────────────────────────────────────────────
interface MongooseCache {
  conn:    typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

// Attach to global to survive hot reloads in development
declare global {
  // eslint-disable-next-line no-var
  var __mongoose: MongooseCache | undefined;
}

const cache: MongooseCache = global.__mongoose ?? { conn: null, promise: null };
global.__mongoose = cache;

// ─── Connection options ───────────────────────────────────────────────────────
const CONNECTION_OPTIONS: mongoose.ConnectOptions = {
  maxPoolSize:                10,   // Max concurrent connections
  serverSelectionTimeoutMS:   5000, // Fail fast if Atlas unreachable
  socketTimeoutMS:            45000,
  family:                     4,    // Use IPv4 — avoids IPv6 issues on some hosts
  bufferCommands:             false, // Fail immediately if not connected
};

// ─── Connect ──────────────────────────────────────────────────────────────────
export async function connectDB(): Promise<typeof mongoose> {
  // Validate at call time, not module load time (build-safe)
  if (!MONGODB_URI) {
    throw new Error("[DB] MONGODB_URI is not defined. Set it in your environment variables.");
  }
  // Return cached connection if available
  if (cache.conn) return cache.conn;

  // No active connection — create one
  if (!cache.promise) {
    mongoose.set("strictQuery", true);

    // Log connection events (dev only to avoid noise in production)
    if (env.NODE_ENV === "development") {
      mongoose.connection.on("connected", () =>
        logger.info("[DB] MongoDB connected")
      );
      mongoose.connection.on("error", (err) =>
        logger.error("[DB] MongoDB error", { err: String(err) })
      );
      mongoose.connection.on("disconnected", () =>
        logger.warn("[DB] MongoDB disconnected")
      );
    }

    cache.promise = mongoose
      .connect(MONGODB_URI || `mongodb://localhost:27017/${BRAND.SLUG}-dev`, CONNECTION_OPTIONS)
      .then((instance) => {
        logger.info("[DB] Connected to MongoDB");
        cache.conn = instance;
        return instance;
      })
      .catch((err) => {
        cache.promise = null; // Reset so next call retries
        logger.error("[DB] Connection failed", { err: String(err) });
        throw err;
      });
  }

  cache.conn = await cache.promise;
  return cache.conn;
}

/**
 * Disconnect — used in scripts and tests only.
 * Never call this in API routes.
 */
export async function disconnectDB(): Promise<void> {
  if (cache.conn) {
    await mongoose.disconnect();
    cache.conn    = null;
    cache.promise = null;
  }
}

/**
 * Health check — returns connection state.
 */
export function getDBState(): "connected" | "disconnected" | "connecting" | "unknown" {
  switch (mongoose.connection.readyState) {
    case 1:  return "connected";
    case 0:  return "disconnected";
    case 2:  return "connecting";
    default: return "unknown";
  }
}
