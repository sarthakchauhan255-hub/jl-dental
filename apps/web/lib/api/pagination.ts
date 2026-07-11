const MIN_LIMIT = 1;
const MAX_LIMIT = 100;
const DEFAULT_LIMIT = 10;

export interface PaginationParams {
  page:  number;
  limit: number;
  skip:  number;
}

/** Parse and clamp pagination params from URLSearchParams. */
export function parsePagination(params: URLSearchParams): PaginationParams {
  const page  = Math.max(1, parseInt(params.get("page")  ?? "1", 10) || 1);
  const limit = Math.min(MAX_LIMIT, Math.max(MIN_LIMIT, parseInt(params.get("limit") ?? String(DEFAULT_LIMIT), 10) || DEFAULT_LIMIT));
  return { page, limit, skip: (page - 1) * limit };
}

export interface PaginationMeta {
  page:       number;
  limit:      number;
  total:      number;
  totalPages: number;
}

export function buildPaginationMeta(page: number, limit: number, total: number): PaginationMeta {
  return { page, limit, total, totalPages: Math.ceil(total / limit) };
}
