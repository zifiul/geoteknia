import { ZodError } from 'zod';

import { ForbiddenError } from '@/lib/auth/rbac-errors';
import { InvalidSessionError } from '@/lib/auth/session';
import { UsersGuardrailError } from '@/lib/admin/users-guardrails';
import { UserNotFoundError } from '@/lib/admin/users-queries';

export type UsersActionErrorCode =
  | 'VALIDATION_ERROR'
  | 'INVALID_SESSION'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'GUARDRAIL'
  | 'INTERNAL_ERROR';

export type UsersActionResult<T = void> =
  | { ok: true; data?: T }
  | { ok: false; error: { code: UsersActionErrorCode; message: string } };

export async function runUsersAction<T>(
  fn: () => Promise<UsersActionResult<T> | T>,
): Promise<UsersActionResult<T>> {
  try {
    const result = await fn();
    if (result && typeof result === 'object' && 'ok' in result) {
      return result as UsersActionResult<T>;
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
    if (error instanceof UserNotFoundError) {
      return {
        ok: false,
        error: { code: 'NOT_FOUND', message: error.message },
      };
    }
    if (error instanceof UsersGuardrailError) {
      return {
        ok: false,
        error: { code: 'GUARDRAIL', message: error.message },
      };
    }
    if (
      error &&
      typeof error === 'object' &&
      'code' in error &&
      (error as { code: string }).code === 'P2002'
    ) {
      return {
        ok: false,
        error: {
          code: 'CONFLICT',
          message: 'Ya existe un usuario con ese email',
        },
      };
    }
    throw error;
  }
}
