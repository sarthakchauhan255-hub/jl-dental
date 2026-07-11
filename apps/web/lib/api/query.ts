import { z } from "zod";

/** Regex-escape a string to use safely in a MongoDB $regex query. */
function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Build a MongoDB case-insensitive text search filter across multiple fields.
 * Input is sanitized — safe against ReDoS and injection.
 */
export function buildSearchFilter(
  raw:    string | null | undefined,
  fields: string[]
): Record<string, unknown> {
  const q = (raw ?? "").trim().slice(0, 200);
  if (!q || fields.length === 0) return {};
  const regex = { $regex: escapeRegex(q), $options: "i" };
  return { $or: fields.map((f) => ({ [f]: regex })) };
}

/** Whitelist-only sort field parser. Returns safe sort object or default. */
export function parseSortField<T extends string>(
  raw:       string | null | undefined,
  allowed:   readonly T[],
  defaultKey: T,
  defaultDir: 1 | -1 = -1
): Record<string, 1 | -1> {
  const order = raw?.startsWith("-") ? -1 : 1;
  const key   = (raw?.replace(/^-/, "") ?? "") as T;
  const safe  = allowed.includes(key) ? key : defaultKey;
  return { [safe]: order as 1 | -1 };
}

/** Parse a boolean query param safely. */
export function parseBoolParam(raw: string | null | undefined): boolean | undefined {
  if (raw === "true")  return true;
  if (raw === "false") return false;
  return undefined;
}

/** Validated query param schemas for common patterns. */
export const querySchemas = {
  pagination: z.object({
    page:  z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(10),
  }),
  search: z.object({
    q: z.string().max(200).optional(),
  }),
  status: (values: readonly [string, ...string[]]) =>
    z.object({ status: z.enum(values).optional() }),
};
