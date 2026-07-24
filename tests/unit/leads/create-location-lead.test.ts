/**
 * GTK-29 — createLocationLead.
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('server-only', () => ({}));

const sendLeadConfirmationMock = vi.fn();
const recordConversionEventMock = vi.fn();

vi.mock('@/lib/email', () => ({
  sendLeadConfirmation: (...args: unknown[]) => sendLeadConfirmationMock(...args),
}));

vi.mock('@/lib/analytics/record-event', () => ({
  recordConversionEvent: (...args: unknown[]) =>
    recordConversionEventMock(...args),
}));

const transactionMock = vi.fn();
const provinceFindMock = vi.fn();
const contactFindMock = vi.fn();
const contactCreateMock = vi.fn();
const contactUpdateMock = vi.fn();
const leadFindUniqueMock = vi.fn();
const leadCreateMock = vi.fn();
const projectCreateMock = vi.fn();
const projectStateFindMock = vi.fn();

vi.mock('@/lib/db', () => ({
  db: {
    $transaction: (fn: (tx: unknown) => Promise<unknown>) => transactionMock(fn),
  },
}));

import type { LocationLeadInput } from '@/lib/leads/schema';

const baseInput: LocationLeadInput = {
  cadastralRef: '1234567DF1234N0001WX',
  email: 'obra@example.com',
  gdprConsent: true,
  turnstileToken: 'ts-token',
};

function buildTx() {
  return {
    province: { findFirst: provinceFindMock },
    contact: {
      findFirst: contactFindMock,
      create: contactCreateMock,
      update: contactUpdateMock,
    },
    lead: {
      findUnique: leadFindUniqueMock,
      create: leadCreateMock,
    },
    project: { create: projectCreateMock },
    projectState: { findFirst: projectStateFindMock },
  };
}

describe('createLocationLead (GTK-29)', () => {
  beforeEach(() => {
    vi.resetModules();
    sendLeadConfirmationMock.mockReset();
    sendLeadConfirmationMock.mockResolvedValue({ ok: true, id: 'email-1' });
    recordConversionEventMock.mockReset();
    recordConversionEventMock.mockResolvedValue({ id: 'evt-1' });
    transactionMock.mockReset();
    provinceFindMock.mockReset();
    contactFindMock.mockResolvedValue(null);
    contactCreateMock.mockResolvedValue({ id: 'contact-1' });
    leadFindUniqueMock.mockResolvedValue(null);
    leadCreateMock.mockResolvedValue({ id: 'lead-1' });
    projectCreateMock.mockResolvedValue({ id: 'proj-1' });
    projectStateFindMock.mockResolvedValue({ id: 'state-1' });

    transactionMock.mockImplementation(async (fn) => fn(buildTx()));
  });

  it('camino feliz con prefijo UBI- y email', async () => {
    const { createLocationLead } = await import('@/lib/leads/create-location-lead');
    const result = await createLocationLead(baseInput);

    expect(result.referenceNumber).toMatch(/^UBI-/);
    expect(leadCreateMock).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          leadType: 'ubicacion',
          channel: 'ubicacion',
          cadastralRef: baseInput.cadastralRef,
        }),
      }),
    );
    expect(sendLeadConfirmationMock).toHaveBeenCalled();
    expect(recordConversionEventMock).toHaveBeenCalledWith(
      expect.objectContaining({
        eventName: 'send_location',
        leadId: 'lead-1',
        leadType: 'ubicacion',
      }),
    );
  });

  it('solo teléfono: no envía email', async () => {
    const { createLocationLead } = await import('@/lib/leads/create-location-lead');
    await createLocationLead({
      cadastralRef: 'REF',
      telefono: '612345678',
      gdprConsent: true,
      turnstileToken: 'ts',
    });

    expect(sendLeadConfirmationMock).not.toHaveBeenCalled();
  });

  it('fallo de send_location no rompe el alta', async () => {
    recordConversionEventMock.mockRejectedValue(new Error('db down'));

    const { createLocationLead } = await import('@/lib/leads/create-location-lead');
    const result = await createLocationLead(baseInput);
    expect(result.leadId).toBe('lead-1');
  });

  it('slug provincia desconocido → 400', async () => {
    provinceFindMock.mockResolvedValue(null);

    const { createLocationLead } = await import('@/lib/leads/create-location-lead');
    await expect(
      createLocationLead({ ...baseInput, provincia: 'no-existe' }),
    ).rejects.toMatchObject({
      code: 'VALIDATION_ERROR',
      status: 400,
    });
  });
});
