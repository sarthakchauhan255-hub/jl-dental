import { z, type ZodSchema } from "zod";
import { ValidationError }    from "@/lib/security/errors";

/**
 * Parse and validate a request body against a Zod schema.
 * Throws ValidationError on failure — caught by handleRouteError.
 */
export async function parseBody<T>(req: Request, schema: ZodSchema<T>): Promise<T> {
  let raw: unknown;
  try { raw = await req.json(); }
  catch { throw new ValidationError("Request body must be valid JSON."); }
  return schema.parse(raw);
}

/**
 * Parse and validate URL search params against a Zod schema.
 * Throws ValidationError on failure.
 */
export function parseQuery<T>(params: URLSearchParams, schema: ZodSchema<T>): T {
  const raw = Object.fromEntries(params.entries());
  return schema.parse(raw);
}

/**
 * Parse and validate a route param (e.g. [id]).
 * Throws NotFoundError if ID is not a valid MongoDB ObjectId.
 */
export function parseObjectId(value: string, label = "ID"): string {
  if (!/^[a-f\d]{24}$/i.test(value)) {
    throw new ValidationError(`${label} is not a valid identifier.`);
  }
  return value;
}
