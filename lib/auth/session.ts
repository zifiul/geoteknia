import 'server-only';

import { createHash } from 'node:crypto';

import type { RoleName } from '@prisma/client';

export type SessionMirrorRow = {
  revokedAt: Date | null;
  expiresAt: Date;
};

export type SessionMirrorState = 'valid' | 'revoked' | 'expired' | 'missing';

export function hashSessionToken(sessionId: string): string {
  return createHash('sha256').update(sessionId, 'utf8').digest('hex');
}

export function evaluateSessionMirror(
  mirror: SessionMirrorRow | null,
  now: Date = new Date(),
): SessionMirrorState {
  if (!mirror) {
    return 'missing';
  }
  if (mirror.revokedAt !== null) {
    return 'revoked';
  }
  if (mirror.expiresAt.getTime() <= now.getTime()) {
    return 'expired';
  }
  return 'valid';
}

export type PortalSessionPayload = {
  userId: string;
  roleId: string;
  roleName: RoleName;
};

export type RequireSessionDeps = {
  getAuthSession: () => Promise<
    (PortalSessionPayload & { sessionTokenHash: string }) | null
  >;
  findSessionMirror: (tokenHash: string) => Promise<SessionMirrorRow | null>;
  now?: Date;
};

export class InvalidSessionError extends Error {
  constructor(message = 'Sesión no válida o expirada') {
    super(message);
    this.name = 'InvalidSessionError';
  }
}

export async function requireSession(
  deps: RequireSessionDeps,
): Promise<PortalSessionPayload> {
  const now = deps.now ?? new Date();
  const authSession = await deps.getAuthSession();

  if (!authSession) {
    throw new InvalidSessionError();
  }

  const mirror = await deps.findSessionMirror(authSession.sessionTokenHash);
  const state = evaluateSessionMirror(mirror, now);

  if (state !== 'valid') {
    throw new InvalidSessionError();
  }

  return {
    userId: authSession.userId,
    roleId: authSession.roleId,
    roleName: authSession.roleName,
  };
}

export async function getServerSession(): Promise<PortalSessionPayload | null> {
  const { auth } = await import('@/lib/auth/config');

  const session = await auth();
  const user = session?.user;

  if (!user?.id || !user.roleId || !user.roleName) {
    return null;
  }

  return {
    userId: user.id,
    roleId: user.roleId,
    roleName: user.roleName as RoleName,
  };
}

/**
 * Wrapper cableado de requireSession con dependencias reales: usarlo para
 * autorización (rbac.ts). A diferencia de getServerSession(), sí comprueba
 * el espejo de sesión en BD (revocación/expiración), no solo el JWT.
 */
export async function getPortalSession(): Promise<PortalSessionPayload> {
  return requireSession({
    getAuthSession: async () => {
      const { auth } = await import('@/lib/auth/config');
      const session = await auth();
      const user = session?.user;

      if (!user?.id || !user.roleId || !user.roleName || !user.sessionTokenHash) {
        return null;
      }

      return {
        userId: user.id,
        roleId: user.roleId,
        roleName: user.roleName as RoleName,
        sessionTokenHash: user.sessionTokenHash,
      };
    },
    findSessionMirror: async (tokenHash: string) => {
      const { db } = await import('@/lib/db');
      return db.session.findFirst({
        where: { tokenHash },
        select: { revokedAt: true, expiresAt: true },
      });
    },
  });
}
