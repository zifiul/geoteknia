/**
 * GTK-29 — upsertContact compartido.
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('server-only', () => ({}));

const contactFindMock = vi.fn();
const contactCreateMock = vi.fn();
const contactUpdateMock = vi.fn();

import { upsertContact } from '@/lib/leads/upsert-contact';

function buildTx() {
  return {
    contact: {
      findFirst: contactFindMock,
      create: contactCreateMock,
      update: contactUpdateMock,
    },
  };
}

describe('upsertContact (GTK-29)', () => {
  beforeEach(() => {
    contactFindMock.mockReset();
    contactCreateMock.mockReset();
    contactUpdateMock.mockReset();
    contactFindMock.mockResolvedValue(null);
    contactCreateMock.mockResolvedValue({ id: 'new' });
  });

  it('crea contacto mínimo solo teléfono', async () => {
    await upsertContact(buildTx() as never, { phone: '612345678' });

    expect(contactCreateMock).toHaveBeenCalledWith({
      data: expect.objectContaining({
        phone: '612345678',
        fullName: null,
        email: null,
      }),
    });
  });

  it('actualiza contacto existente por email', async () => {
    contactFindMock.mockResolvedValue({
      id: 'c1',
      fullName: null,
      email: 'a@b.com',
      phone: null,
      company: null,
      professionalRole: null,
      provinceId: null,
    });
    contactUpdateMock.mockResolvedValue({ id: 'c1' });

    await upsertContact(buildTx() as never, {
      email: 'a@b.com',
      phone: '699999999',
    });

    expect(contactCreateMock).not.toHaveBeenCalled();
    expect(contactUpdateMock).toHaveBeenCalled();
  });
});
