/**
 * Database helper utilities for API routes.
 * Thin wrappers that enforce consistent patterns.
 */
import mongoose from "mongoose";
import { NotFoundError } from "@/lib/security/errors";

/**
 * Assert a Mongoose document exists — throws NotFoundError if null.
 */
export function assertDocument<T>(
  doc: T | null | undefined,
  resource = "Document"
): asserts doc is T {
  if (!doc) throw new NotFoundError(resource);
}

/**
 * Type-safe ObjectId validation.
 * Use before passing user-supplied IDs to Mongoose queries.
 */
export function isValidObjectId(id: string): boolean {
  return mongoose.isValidObjectId(id);
}

export function toObjectId(id: string): mongoose.Types.ObjectId {
  if (!isValidObjectId(id)) throw new Error(`Invalid ObjectId: ${id}`);
  return new mongoose.Types.ObjectId(id);
}

/**
 * Build a MongoDB text search filter from a query string.
 * Sanitizes input to prevent ReDoS.
 */
export function buildSearchFilter(
  query: string,
  fields: string[]
): Record<string, unknown> {
  if (!query.trim()) return {};
  // Escape regex special chars
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").slice(0, 100);
  const regex = { $regex: escaped, $options: "i" };
  return { $or: fields.map((field) => ({ [field]: regex })) };
}

/**
 * Standard pagination params from URL searchParams.
 */
export function parsePagination(searchParams: URLSearchParams): {
  page:  number;
  limit: number;
  skip:  number;
} {
  const page  = Math.max(1, parseInt(searchParams.get("page")  ?? "1"));
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") ?? "10")));
  return { page, limit, skip: (page - 1) * limit };
}

/**
 * Lean query helper — returns plain JS objects instead of Mongoose docs.
 * Always use .lean() on read-only queries for performance.
 */
export const LEAN = { lean: true } as const;
