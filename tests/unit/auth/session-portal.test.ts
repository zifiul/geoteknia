/**
 * getPortalSession — GTK-25 / rbac-authorization (SEC-3): wrapper cableado
 * de requireSession con dependencias reales (auth() + espejo en BD).
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('server-only', () => ({}));

const authMock = vi.fn();
const findFirstMock = vi.fn();

vi.mock('@/lib/auth/config', () => ({
  auth: authMock,
}));

vi.mock('@/lib/db', () => ({
  db: {
    session: {
      findFirst: findFirstMock,
    },
  },
}));

const future = new Date(Date.now() + 60_000);
const past = new Date(Date.now() - 60_000);

describe('getPortalSession (GTK-25 / SEC-3)', () => {
  beforeEach(() => {
    vi.resetModules();
    authMock.mockReset();
    findFirstMock.mockReset();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('sin sesión Auth.js: lanza InvalidSessionError sin consultar el espejo', async () => {
    authMock.mockResolvedValue(null);

    const { getPortalSession, InvalidSessionError } = await import(
      '@/lib/auth/session'
    );

    await expect(getPortalSession()).rejects.toBeInstanceOf(InvalidSessionError);
    expect(findFirstMock).not.toHaveBeenCalled();
  });

  it('sesión válida y espejo activo en BD: devuelve el PortalSessionPayload', async () => {
    authMock.mockResolvedValue({
      user: {
        id: '11111111-1111-4111-8111-111111111111',
        roleId: '22222222-2222-4222-8222-222222222222',
        roleName: 'admin',
        sessionTokenHash: 'hash-abc',
      },
    });
    findFirstMock.mockResolvedValue({ revokedAt: null, expiresAt: future });

    const { getPortalSession } = await import('@/lib/auth/session');

    await expect(getPortalSession()).resolves.toEqual({
      userId: '11111111-1111-4111-8111-111111111111',
      roleId: '22222222-2222-4222-8222-222222222222',
      roleName: 'admin',
    });
  });

  it('JWT válido pero espejo revocado en BD: lanza InvalidSessionError (no confía solo en el JWT)', async () => {
    authMock.mockResolvedValue({
      user: {
        id: '11111111-1111-4111-8111-111111111111',
        roleId: '22222222-2222-4222-8222-222222222222',
        roleName: 'editor',
        sessionTokenHash: 'hash-revoked',
      },
    });
    findFirstMock.mockResolvedValue({ revokedAt: new Date(), expiresAt: future });

    const { getPortalSession, InvalidSessionError } = await import(
      '@/lib/auth/session'
    );

    await expect(getPortalSession()).rejects.toBeInstanceOf(InvalidSessionError);
  });

  it('JWT válido pero espejo expirado en BD: lanza InvalidSessionError', async () => {
    authMock.mockResolvedValue({
      user: {
        id: '11111111-1111-4111-8111-111111111111',
        roleId: '22222222-2222-4222-8222-222222222222',
        roleName: 'editor',
        sessionTokenHash: 'hash-expired',
      },
    });
    findFirstMock.mockResolvedValue({ revokedAt: null, expiresAt: past });

    const { getPortalSession, InvalidSessionError } = await import(
      '@/lib/auth/session'
    );

    await expect(getPortalSession()).rejects.toBeInstanceOf(InvalidSessionError);
  });

  it('consulta el espejo por tokenHash, no por el JWT en claro', async () => {
    authMock.mockResolvedValue({
      user: {
        id: '11111111-1111-4111-8111-111111111111',
        roleId: '22222222-2222-4222-8222-222222222222',
        roleName: 'admin',
        sessionTokenHash: 'hash-abc',
      },
    });
    findFirstMock.mockResolvedValue({ revokedAt: null, expiresAt: future });

    const { getPortalSession } = await import('@/lib/auth/session');
    await getPortalSession();

    expect(findFirstMock).toHaveBeenCalledWith(
      expect.objectContaining({ where: { tokenHash: 'hash-abc' } }),
    );
  });
});
