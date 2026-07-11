/**
 * Shared serialization primitives — the ONLY place lean() results are widened.
 *
 * ARCHITECTURE:
 *   Mongoose lean() result → LeanDoc (single documented widening) → resource mapper → DTO
 *
 * Every resource mapper receives a LeanDoc and returns a fully-typed DTO.
 * API routes and pages never perform field-by-field assertions.
 */
import type { Types } from "mongoose";

/** A lean Mongoose result, widened once at the mapper boundary. */
export type LeanDoc = Record<string, unknown>;

/**
 * THE single widening point for Mongoose lean() results.
 * lean() returns `FlattenMaps<T> & { _id: ObjectId }` which is structurally
 * incompatible with Record<string, unknown> in strict TS. This helper
 * documents and contains that unavoidable widening in one function.
 */
export function asLean(doc: unknown): LeanDoc {
  return doc as LeanDoc;
}

export function serializeObjectId(value: unknown): string {
  return String(value as Types.ObjectId | string);
}

export function serializeDate(value: unknown): string {
  if (value instanceof Date) return value.toISOString();
  return String(value ?? "");
}

export function serializeOptionalDate(value: unknown): string | undefined {
  if (value instanceof Date) return value.toISOString();
  if (typeof value === "string" && value) return value;
  return undefined;
}

export function serializeNullableDate(value: unknown): string | null {
  if (value instanceof Date) return value.toISOString();
  if (typeof value === "string" && value) return value;
  return null;
}

export interface MediaAssetDto {
  url:      string;
  publicId: string;
  alt?:     string;
}

export function normalizeMediaAsset(value: unknown): MediaAssetDto | null {
  if (!value || typeof value !== "object") return null;
  const v = value as Record<string, unknown>;
  if (typeof v.url !== "string" || typeof v.publicId !== "string") return null;
  return {
    url:      v.url,
    publicId: v.publicId,
    ...(typeof v.alt === "string" ? { alt: v.alt } : {}),
  };
}

export interface SeoDto {
  title?:       string;
  description?: string;
  canonical?:   string;
}

export function normalizeSeoMetadata(value: unknown): SeoDto {
  if (!value || typeof value !== "object") return {};
  const v = value as Record<string, unknown>;
  return {
    ...(typeof v.title === "string"       ? { title: v.title }             : {}),
    ...(typeof v.description === "string" ? { description: v.description } : {}),
    ...(typeof v.canonical === "string"   ? { canonical: v.canonical }     : {}),
  };
}

export function str(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

export function num(value: unknown, fallback = 0): number {
  return typeof value === "number" ? value : fallback;
}

export function bool(value: unknown, fallback = false): boolean {
  return typeof value === "boolean" ? value : fallback;
}

export function strArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((x): x is string => typeof x === "string") : [];
}
