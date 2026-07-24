import { ZodError } from 'zod';

import { ForbiddenError } from '@/lib/auth/rbac-errors';
import { InvalidSessionError } from '@/lib/auth/session';

export type IaActionErrorCode =
  | 'VALIDATION_ERROR'
  | 'INVALID_SESSION'
  | 'FORBIDDEN'
  | 'INTERNAL_ERROR';

export type IaActionResult<T = void> =
  | { ok: true; data?: T }
  | { ok: false; error: { code: IaActionErrorCode; message: string } };

export async function runIaAction<T>(
  fn: () => Promise<T>,
): Promise<IaActionResult<T>> {
  try {
    const data = await fn();
    return { ok: true, data };
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
    throw error;
  }
}
