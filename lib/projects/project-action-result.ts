import { ZodError } from 'zod';

import { ForbiddenError } from '@/lib/auth/rbac-errors';
import { InvalidSessionError } from '@/lib/auth/session';
import {
  InvalidTransitionError,
  ProjectNotFoundError,
  ProjectValidationError,
} from '@/lib/projects/errors';

export type ProjectActionErrorCode =
  | 'VALIDATION_ERROR'
  | 'INVALID_SESSION'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'INTERNAL_ERROR';

export type ProjectActionResult<T = void> =
  | { ok: true; data?: T }
  | { ok: false; error: { code: ProjectActionErrorCode; message: string } };

export async function runProjectAction<T>(
  fn: () => Promise<T>,
): Promise<ProjectActionResult<T>> {
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
    if (error instanceof ProjectNotFoundError) {
      return {
        ok: false,
        error: { code: 'NOT_FOUND', message: error.message },
      };
    }
    if (error instanceof InvalidTransitionError) {
      return {
        ok: false,
        error: { code: 'CONFLICT', message: error.message },
      };
    }
    if (error instanceof ProjectValidationError) {
      return {
        ok: false,
        error: { code: 'VALIDATION_ERROR', message: error.message },
      };
    }
    throw error;
  }
}
