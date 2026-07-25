import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('server-only', () => ({}));

const { findFirst } = vi.hoisted(() => ({
  findFirst: vi.fn(),
}));

vi.mock('next/cache', () => ({
  unstable_cache: (fn: () => Promise<unknown>) => fn,
}));

vi.mock('@/lib/db', () => ({
  db: {
    organizationProfile: {
      findFirst,
    },
  },
}));

import { getOrganizationProfile } from '@/lib/content/organization';

describe('getOrganizationProfile', () => {
  beforeEach(() => {
    findFirst.mockReset();
  });

  it('devuelve solo campos NAP públicos', async () => {
    findFirst.mockResolvedValue({
      displayName: 'Geoteknia',
      legalName: 'Geoteknia S.L.',
      napAddress: 'Calle 1',
      napPhone: '+34900000000',
      napEmail: 'info@geoteknia.local',
    });

    const profile = await getOrganizationProfile();
    expect(profile).toEqual({
      displayName: 'Geoteknia',
      legalName: 'Geoteknia S.L.',
      napAddress: 'Calle 1',
      napPhone: '+34900000000',
      napEmail: 'info@geoteknia.local',
    });
    expect(findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        select: {
          displayName: true,
          legalName: true,
          napAddress: true,
          napPhone: true,
          napEmail: true,
        },
      }),
    );
  });

  it('devuelve null si no hay perfil', async () => {
    findFirst.mockResolvedValue(null);
    await expect(getOrganizationProfile()).resolves.toBeNull();
  });
});
