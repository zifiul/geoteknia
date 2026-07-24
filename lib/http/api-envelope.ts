import { NextResponse } from 'next/server';

export type ApiErrorBody = {
  code: string;
  message: string;
  details?: Record<string, unknown>[];
};

export function apiSuccess<T extends Record<string, unknown>>(
  data: T,
  status = 200,
): NextResponse {
  return NextResponse.json({ success: true, data }, { status });
}

export function apiError(
  status: number,
  error: ApiErrorBody,
  headers?: HeadersInit,
): NextResponse {
  return NextResponse.json({ success: false, error }, { status, headers });
}

export function zodFieldDetails(
  issues: { path: (string | number)[]; message: string }[],
): Record<string, unknown>[] {
  return issues.map((issue) => ({
    path: issue.path.join('.'),
    message: issue.message,
  }));
}
