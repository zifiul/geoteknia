import { ContactDepartment } from '@prisma/client';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('server-only', () => ({}));

const { contactFindFirst } = vi.hoisted(() => ({
  contactFindFirst: vi.fn(),
}));

vi.mock('next/cache', () => ({
  unstable_cache: (fn: () => Promise<unknown>) => fn,
}));

vi.mock('@/lib/db', () => ({
  db: {
    organizationProfile: {
      findFirst: vi.fn(),
    },
    contactChannel: {
      findFirst: contactFindFirst,
    },
  },
}));

import { getContactChannelByDepartment } from '@/lib/content/organization';

describe('getContactChannelByDepartment', () => {
  beforeEach(() => {
    contactFindFirst.mockReset();
  });

  it('devuelve canal con plantilla para el departamento', async () => {
    contactFindFirst.mockResolvedValue({
      phone: '+34900000001',
      whatsappNumber: '+34900000001',
      email: 'presupuestos@geoteknia.local',
      prefilledMessageTemplate: 'Hola {{servicio}}',
    });

    const channel = await getContactChannelByDepartment(ContactDepartment.presupuestos);
    expect(channel).toEqual({
      phone: '+34900000001',
      whatsappNumber: '+34900000001',
      email: 'presupuestos@geoteknia.local',
      prefilledMessageTemplate: 'Hola {{servicio}}',
    });
    expect(contactFindFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ department: ContactDepartment.presupuestos }),
      }),
    );
  });

  it('devuelve null si no hay canal activo', async () => {
    contactFindFirst.mockResolvedValue(null);
    await expect(getContactChannelByDepartment(ContactDepartment.direccion_tecnica)).resolves.toBeNull();
  });
});
