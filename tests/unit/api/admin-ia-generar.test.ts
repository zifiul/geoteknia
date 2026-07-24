/**
 * Tests GTK-38 — permiso ai.generate en Route Handler.
 */
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

import { withRoutePermission } from '@/lib/auth/rbac';

describe('withRoutePermission ai.generate (GTK-38 / SEC-1)', () => {
  beforeEach(() => {
    getPortalSession.mockReset();
  });

  it('403 para gestor sin permiso ai.generate', async () => {
    getPortalSession.mockResolvedValue({
      userId: 'u1',
      roleId: 'r1',
      roleName: 'gestor',
    });

    const handler = vi.fn();
    const wrapped = withRoutePermission('ai.generate', handler);
    const response = await wrapped(new Request('http://localhost'));

    expect(response.status).toBe(403);
    expect(handler).not.toHaveBeenCalled();
  });

  it('invoca handler para editor con ai.generate', async () => {
    getPortalSession.mockResolvedValue({
      userId: 'u2',
      roleId: 'r2',
      roleName: 'editor',
    });

    const handler = vi.fn().mockResolvedValue(new Response('ok'));
    const wrapped = withRoutePermission('ai.generate', handler);
    const request = new Request('http://localhost');
    await wrapped(request);

    expect(handler).toHaveBeenCalledWith(
      expect.objectContaining({ roleName: 'editor' }),
      request,
    );
  });
});
