/**
 * GTK-26 — middleware /admin (SEC-1, SEC-2, SEC-3).
 */
import { NextRequest } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const authMock = vi.fn();

vi.mock('@/lib/auth/auth-edge', () => ({
  auth: (...args: unknown[]) => authMock(...args),
}));

import { middleware } from '@/middleware';

function buildRequest(path: string): NextRequest {
  return new NextRequest(new URL(`http://localhost:3000${path}`));
}

describe('middleware — protección /admin', () => {
  beforeEach(() => {
    authMock.mockReset();
  });

  it('SEC-1: página /admin sin sesión redirige a login', async () => {
    authMock.mockResolvedValue(null);

    const response = await middleware(buildRequest('/admin'));

    expect(response.status).toBe(307);
    const location = response.headers.get('location');
    expect(location).toMatch(/\/admin\/login/);
  });

  it('SEC-2: API /api/admin sin sesión responde 401 JSON', async () => {
    authMock.mockResolvedValue(null);

    const response = await middleware(buildRequest('/api/admin/health'));

    expect(response.status).toBe(401);
    expect(response.headers.get('content-type')).toMatch(/application\/json/);
    const body = await response.json();
    expect(body).toMatchObject({ success: false });
    expect(JSON.stringify(body)).not.toMatch(/@/);
  });

  it('SEC-3: respuesta con sesión válida incluye X-Robots-Tag', async () => {
    authMock.mockResolvedValue({
      user: { id: 'user-1', email: 'a@test.com' },
    });

    const response = await middleware(buildRequest('/admin/dashboard'));

    expect(response.headers.get('X-Robots-Tag')).toBe('noindex, nofollow');
  });

  it('permite continuar con sesión válida en página admin', async () => {
    authMock.mockResolvedValue({
      user: { id: 'user-1', email: 'a@test.com' },
    });

    const response = await middleware(buildRequest('/admin'));

    expect(response.status).toBe(200);
  });
});
