/**
 * Primitiva de autorización — GTK-25 / rbac-authorization (SEC-1..SEC-5).
 */
import type { RoleName } from '@prisma/client';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('server-only', () => ({}));

const { getPortalSession } = vi.hoisted(() => ({ getPortalSession: vi.fn() }));

vi.mock('@/lib/auth/session', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/auth/session')>();
  return {
    ...actual,
    getPortalSession,
  };
});

import { PERMISSIONS, resolvePermissionCodesForRole } from '@/lib/auth/permissions';
import { ForbiddenError } from '@/lib/auth/rbac-errors';
import {
  assertOwnership,
  can,
  requirePermission,
  withPermission,
  withRoutePermission,
} from '@/lib/auth/rbac';
import { InvalidSessionError } from '@/lib/auth/session';

function makeUser(roleName: RoleName, userId = '11111111-1111-4111-8111-111111111111') {
  return { userId, roleId: '22222222-2222-4222-8222-222222222222', roleName };
}

const ROLES: RoleName[] = ['admin', 'gestor', 'editor', 'tecnico'];

describe('can (GTK-25 / SEC-1)', () => {
  it('coincide con resolvePermissionCodesForRole para los 4 roles y los 17 permisos', () => {
    for (const roleName of ROLES) {
      const allowed = new Set(resolvePermissionCodesForRole(roleName));
      const user = makeUser(roleName);
      for (const permission of PERMISSIONS) {
        expect(can(user, permission.code)).toBe(allowed.has(permission.code));
      }
    }
  });
});

describe('assertOwnership (GTK-25 / SEC-2)', () => {
  it('tecnico dueño del recurso: no lanza', () => {
    const user = makeUser('tecnico');
    expect(() =>
      assertOwnership({ assignedTechnicianId: user.userId }, user),
    ).not.toThrow();
  });

  it('tecnico ajeno al recurso: lanza ForbiddenError', () => {
    const user = makeUser('tecnico');
    expect(() =>
      assertOwnership({ assignedTechnicianId: 'otro-id' }, user),
    ).toThrow(ForbiddenError);
  });

  it('tecnico sin técnico asignado (null): lanza ForbiddenError', () => {
    const user = makeUser('tecnico');
    expect(() =>
      assertOwnership({ assignedTechnicianId: null }, user),
    ).toThrow(ForbiddenError);
  });

  it.each(['admin', 'gestor'] as const)(
    '%s nunca está sujeto a pertenencia',
    (roleName) => {
      const user = makeUser(roleName);
      expect(() =>
        assertOwnership({ assignedTechnicianId: 'cualquier-otro-id' }, user),
      ).not.toThrow();
    },
  );
});

describe('requirePermission (GTK-25 / SEC-1, SEC-3)', () => {
  beforeEach(() => {
    getPortalSession.mockReset();
  });

  it('sin sesión válida: propaga InvalidSessionError (401) sin comprobar el permiso', async () => {
    getPortalSession.mockRejectedValue(new InvalidSessionError());

    await expect(requirePermission('projects.update')).rejects.toBeInstanceOf(
      InvalidSessionError,
    );
  });

  it('sesión revocada/expirada en BD: propaga InvalidSessionError (verifica que usa getPortalSession, no getServerSession)', async () => {
    getPortalSession.mockRejectedValue(new InvalidSessionError());

    await expect(requirePermission('projects.read')).rejects.toBeInstanceOf(
      InvalidSessionError,
    );
    expect(getPortalSession).toHaveBeenCalledTimes(1);
  });

  it('sesión válida sin permiso: lanza ForbiddenError (403) antes de ejecutar cualquier efecto', async () => {
    getPortalSession.mockResolvedValue(makeUser('editor'));

    await expect(requirePermission('projects.update')).rejects.toBeInstanceOf(
      ForbiddenError,
    );
  });

  it('sesión válida con permiso: devuelve el PortalSessionPayload', async () => {
    const user = makeUser('gestor');
    getPortalSession.mockResolvedValue(user);

    await expect(requirePermission('projects.update')).resolves.toEqual(user);
  });
});

describe('withPermission (GTK-25 / SEC-4)', () => {
  beforeEach(() => {
    getPortalSession.mockReset();
  });

  it('no invoca el handler cuando se deniega el permiso', async () => {
    getPortalSession.mockResolvedValue(makeUser('editor'));
    const handler = vi.fn();
    const wrapped = withPermission('projects.update', handler);

    await expect(wrapped()).rejects.toBeInstanceOf(ForbiddenError);
    expect(handler).not.toHaveBeenCalled();
  });

  it('no invoca el handler cuando no hay sesión válida', async () => {
    getPortalSession.mockRejectedValue(new InvalidSessionError());
    const handler = vi.fn();
    const wrapped = withPermission('projects.update', handler);

    await expect(wrapped()).rejects.toBeInstanceOf(InvalidSessionError);
    expect(handler).not.toHaveBeenCalled();
  });

  it('invoca el handler con el usuario cuando concede', async () => {
    const user = makeUser('admin');
    getPortalSession.mockResolvedValue(user);
    const handler = vi.fn().mockResolvedValue('ok');
    const wrapped = withPermission('projects.update', handler);

    await expect(wrapped('arg1')).resolves.toBe('ok');
    expect(handler).toHaveBeenCalledWith(user, 'arg1');
  });
});

describe('withRoutePermission (GTK-25 / SEC-4, SEC-5)', () => {
  beforeEach(() => {
    getPortalSession.mockReset();
  });

  it('devuelve 401 sin invocar el handler cuando no hay sesión válida', async () => {
    getPortalSession.mockRejectedValue(new InvalidSessionError());
    const handler = vi.fn();
    const wrapped = withRoutePermission('projects.update', handler);

    const response = await wrapped(new Request('http://localhost/api/x'));

    expect(response.status).toBe(401);
    expect(handler).not.toHaveBeenCalled();
    const body = await response.json();
    expect(body.success).toBe(false);
  });

  it('devuelve 403 sin invocar el handler cuando no tiene permiso', async () => {
    getPortalSession.mockResolvedValue(makeUser('editor'));
    const handler = vi.fn();
    const wrapped = withRoutePermission('projects.update', handler);

    const response = await wrapped(new Request('http://localhost/api/x'));

    expect(response.status).toBe(403);
    expect(handler).not.toHaveBeenCalled();
  });

  it('SEC-5: el cuerpo de error no revela si el recurso existe', async () => {
    getPortalSession.mockResolvedValue(makeUser('editor'));
    const handler = vi.fn();
    const wrapped = withRoutePermission('projects.update', handler);

    const response = await wrapped(new Request('http://localhost/api/x'));
    const body = await response.json();

    expect(JSON.stringify(body)).not.toMatch(/exist|encontr|found/i);
  });

  it('delega en el handler y devuelve su resultado cuando concede', async () => {
    const user = makeUser('admin');
    getPortalSession.mockResolvedValue(user);
    const okResponse = new Response(JSON.stringify({ success: true }), {
      status: 200,
    });
    const handler = vi.fn().mockResolvedValue(okResponse);
    const wrapped = withRoutePermission('projects.update', handler);
    const request = new Request('http://localhost/api/x');

    const response = await wrapped(request);

    expect(handler).toHaveBeenCalledWith(user, request);
    expect(response).toBe(okResponse);
  });

  it('propaga sin envolver un error de negocio del handler (no auth)', async () => {
    getPortalSession.mockResolvedValue(makeUser('admin'));
    const businessError = new Error('fallo de negocio no relacionado con auth');
    const handler = vi.fn().mockRejectedValue(businessError);
    const wrapped = withRoutePermission('projects.update', handler);

    await expect(wrapped(new Request('http://localhost/api/x'))).rejects.toBe(
      businessError,
    );
  });
});
