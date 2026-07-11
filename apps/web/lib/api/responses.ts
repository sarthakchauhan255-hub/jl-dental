import { NextResponse } from "next/server";

export interface ApiSuccess<T> {
  success: true;
  data:    T;
  message?: string;
}

export interface ApiError {
  success: false;
  error:   string;
  code?:   string;
  fields?: Record<string, string>;
}

export interface ApiPaginated<T> extends ApiSuccess<T[]> {
  pagination: {
    page:       number;
    limit:      number;
    total:      number;
    totalPages: number;
  };
}

export function ok<T>(data: T, status = 200): NextResponse<ApiSuccess<T>> {
  return NextResponse.json({ success: true, data }, { status });
}

export function created<T>(data: T): NextResponse<ApiSuccess<T>> {
  return NextResponse.json({ success: true, data }, { status: 201 });
}

export function noContent(): NextResponse {
  return new NextResponse(null, { status: 204 });
}

export function paginated<T>(
  data:       T[],
  page:       number,
  limit:      number,
  total:      number
): NextResponse<ApiPaginated<T>> {
  return NextResponse.json({
    success: true,
    data,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
}

export function err(
  message: string,
  status:  number,
  extras?: { code?: string; fields?: Record<string, string> }
): NextResponse<ApiError> {
  return NextResponse.json(
    { success: false, error: message, ...extras },
    { status }
  );
}
