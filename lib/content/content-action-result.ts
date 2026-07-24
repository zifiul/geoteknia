import { ZodError } from 'zod';

import { ForbiddenError } from '@/lib/auth/rbac-errors';
import { InvalidSessionError } from '@/lib/auth/session';
import {
  ContentConflictError,
  ContentNotFoundError,
  ContentValidationError,
} from '@/lib/content/errors';

export type ContentActionErrorCode =
  | 'VALIDATION_ERROR'
  | 'INVALID_SESSION'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'INTERNAL_ERROR';

export type ContentActionResult<T = void> =
  | { ok: true; data?: T; warning?: string }
  | { ok: false; error: { code: ContentActionErrorCode; message: string } };

export async function runContentAction<T>(
  fn: () => Promise<ContentActionResult<T> | T>,
): Promise<ContentActionResult<T>> {
  try {
    const result = await fn();
    if (result && typeof result === 'object' && 'ok' in result) {
      return result as ContentActionResult<T>;
    }
    return { ok: true, data: result as T };
  } catch (error) {
    if (error instanceof ZodError) {
      return {
        ok: false,
        error: { code: 'VALIDATION_ERROR', message: 'Datos no válidos' },
      };
    }
    if (error instanceof InvalidSessionError) {
      return {
        ok: false,
        error: { code: 'INVALID_SESSION', message: error.message },
      };
    }
    if (error instanceof ForbiddenError) {
      return {
        ok: false,
        error: { code: 'FORBIDDEN', message: 'Acceso denegado' },
      };
    }
    if (error instanceof ContentNotFoundError) {
      return {
        ok: false,
        error: { code: 'NOT_FOUND', message: error.message },
      };
    }
    if (error instanceof ContentConflictError) {
      return {
        ok: false,
        error: { code: 'CONFLICT', message: error.message },
      };
    }
    if (error instanceof ContentValidationError) {
      return {
        ok: false,
        error: { code: 'VALIDATION_ERROR', message: error.message },
      };
    }
    throw error;
  }
}
