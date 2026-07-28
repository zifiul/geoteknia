import type { RoleName } from '@prisma/client';

export class UsersGuardrailError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'UsersGuardrailError';
  }
}

export function assertActorNotSelfTarget(
  actorUserId: string,
  targetUserId: string,
  actionLabel: string,
): void {
  if (actorUserId === targetUserId) {
    throw new UsersGuardrailError(
      `No puedes ${actionLabel} tu propia cuenta de administrador.`,
    );
  }
}

export type LastAdminCheckInput = {
  targetIsAdmin: boolean;
  targetIsActive: boolean;
  otherActiveAdminCount: number;
};

/** Impide dejar el sistema sin al menos un administrador activo. */
export function assertNotRemovingLastAdmin(
  input: LastAdminCheckInput,
  action: 'deactivate' | 'demote',
): void {
  if (!input.targetIsAdmin || !input.targetIsActive) {
    return;
  }
  if (input.otherActiveAdminCount > 0) {
    return;
  }

  const verb =
    action === 'deactivate'
      ? 'desactivar al único administrador activo'
      : 'cambiar el rol del único administrador activo';
  throw new UsersGuardrailError(
    `No se puede ${verb}. Debe quedar al menos un administrador activo.`,
  );
}

export function isAdminRoleName(roleName: RoleName): boolean {
  return roleName === 'admin';
}
