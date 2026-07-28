import { describe, expect, it, vi, beforeEach } from 'vitest';

vi.mock('server-only', () => ({}));

const updateMany = vi.fn();

vi.mock('@/lib/db', () => ({
  db: {
    session: { updateMany },
  },
}));

describe('revokeAllSessionsForUser', () => {
  beforeEach(() => {
    updateMany.mockReset();
  });

  it('revoca solo sesiones activas del usuario indicado', async () => {
    updateMany.mockResolvedValue({ count: 2 });
    const { revokeAllSessionsForUser } = await import('@/lib/auth/session');

    const count = await revokeAllSessionsForUser('user-a');

    expect(count).toBe(2);
    expect(updateMany).toHaveBeenCalledWith({
      where: { userId: 'user-a', revokedAt: null },
      data: { revokedAt: expect.any(Date) },
    });
  });
});
