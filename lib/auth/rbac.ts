import 'server-only';

import { resolvePermissionCodesForRole } from '@/lib/auth/permissions';
import { ForbiddenError } from '@/lib/auth/rbac-errors';
import {
  getPortalSession,
  InvalidSessionError,
  type PortalSessionPayload,
} from '@/lib/auth/session';

/** Recurso con propietario opcional por técnico asignado (GTK-25 / SEC-2). */
export type OwnableResource = {
  assignedTechnicianId: string | null;
};

/** Resuelve el permiso en memoria contra la matriz rol→permiso (sin BD). */
export function can(user: PortalSessionPayload, permissionCode: string): boolean {
  return resolvePermissionCodesForRole(user.roleName).includes(permissionCode);
}

/**
 * Exige sesión válida (espejo en BD, ver getPortalSession) y el permiso
 * indicado. Lanza InvalidSessionError (401) o ForbiddenError (403).
 */
export async function requirePermission(
  permissionCode: string,
): Promise<PortalSessionPayload> {
  const user = await getPortalSession();

  if (!can(user, permissionCode)) {
    throw new ForbiddenError();
  }

  return user;
}

/**
 * No-op para admin/gestor. Para tecnico, exige que el recurso esté asignado
 * al propio usuario; mismo ForbiddenError genérico que requirePermission
 * (anti-enumeración).
 */
export function assertOwnership(
  resource: OwnableResource,
  user: PortalSessionPayload,
): void {
  if (user.roleName !== 'tecnico') {
    return;
  }

  if (resource.assignedTechnicianId !== user.userId) {
    throw new ForbiddenError();
  }
}

/** Envuelve un Server Action exigiendo el permiso antes de ejecutarlo. */
export function withPermission<Args extends unknown[], Result>(
  code: string,
  handler: (user: PortalSessionPayload, ...args: Args) => Promise<Result>,
): (...args: Args) => Promise<Result> {
  return async (...args: Args) => {
    const user = await requirePermission(code);
    return handler(user, ...args);
  };
}

function denialResponse(status: 401 | 403, code: string, message: string): Response {
  return Response.json({ success: false, error: { code, message } }, { status });
}

/** Envuelve un Route Handler exigiendo el permiso antes de ejecutarlo. */
export function withRoutePermission(
  code: string,
  handler: (user: PortalSessionPayload, request: Request) => Promise<Response>,
): (request: Request) => Promise<Response> {
  return async (request: Request) => {
    try {
      const user = await requirePermission(code);
      return await handler(user, request);
    } catch (error) {
      if (error instanceof InvalidSessionError) {
        return denialResponse(401, 'invalid_session', error.message);
      }
      if (error instanceof ForbiddenError) {
        return denialResponse(403, 'forbidden', error.message);
      }
      throw error;
    }
  };
}
