/**
 * GTK-39 — RBAC en Server Actions de workflow (SEC-1, SEC-3).
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('server-only', () => ({}));

const { requirePermission, publishContentEffect } = vi.hoisted(() => ({
  requirePermission: vi.fn(),
  publishContentEffect: vi.fn(),
}));

vi.mock('@/lib/auth/rbac', () => ({
  requirePermission,
}));

vi.mock('@/lib/content/publish', () => ({
  publishContent: publishContentEffect,
}));

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

import { ForbiddenError } from '@/lib/auth/rbac-errors';
import { InvalidSessionError } from '@/lib/auth/session';
import { transitionToPublish } from '@/app/(admin)/(portal)/contenido/[type]/[id]/actions';

const USER_ID = '11111111-1111-4111-8111-111111111111';

describe('workflow Server Actions RBAC (GTK-39)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    publishContentEffect.mockResolvedValue({
      workflowStatus: 'publicado',
    });
  });

  it('SEC-3: sin sesión → INVALID_SESSION', async () => {
    requirePermission.mockRejectedValue(new InvalidSessionError());

    const result = await transitionToPublish('service', USER_ID);

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe('INVALID_SESSION');
    }
    expect(publishContentEffect).not.toHaveBeenCalled();
  });

  it('SEC-1: sin content.publish → FORBIDDEN', async () => {
    requirePermission.mockRejectedValue(new ForbiddenError('content.publish'));

    const result = await transitionToPublish('service', USER_ID);

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe('FORBIDDEN');
    }
  });

  it('mismo editor puede publicar con permiso publish', async () => {
    requirePermission.mockResolvedValue({
      userId: USER_ID,
      roleName: 'editor',
      roleId: '22222222-2222-4222-8222-222222222222',
    });

    const result = await transitionToPublish('service', USER_ID);

    expect(result.ok).toBe(true);
    expect(publishContentEffect).toHaveBeenCalled();
  });
});
