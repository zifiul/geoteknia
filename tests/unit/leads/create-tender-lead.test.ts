/**
 * GTK-31 — createTenderLead.
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
const leadFindUniqueMock = vi.fn();
const leadCreateMock = vi.fn();
const projectCreateMock = vi.fn();
const projectStateFindMock = vi.fn();

vi.mock('@/lib/db', () => ({
  db: {
    $transaction: (fn: (tx: unknown) => Promise<unknown>) => transactionMock(fn),
  },
}));

import type { TenderLeadInput } from '@/lib/leads/schema';

const baseInput: TenderLeadInput = {
  nombre: 'Ana López',
  empresa: 'Constructora SA',
  email: 'licitacion@example.com',
  expedienteRef: 'EXP-2026-001',
  importeEstimado: 250000,
  gdprConsent: true,
  turnstileToken: 'ts-token',
};

function buildTx() {
  return {
    province: { findFirst: provinceFindMock },
    contact: {
      findFirst: contactFindMock,
      create: contactCreateMock,
      update: vi.fn(),
    },
    lead: {
      findUnique: leadFindUniqueMock,
      create: leadCreateMock,
    },
    project: { create: projectCreateMock },
    projectState: { findFirst: projectStateFindMock },
  };
}

describe('createTenderLead (GTK-31)', () => {
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

  it('camino feliz con prefijo LIC- y generate_lead licitacion', async () => {
    const { createTenderLead } = await import('@/lib/leads/create-tender-lead');
    const result = await createTenderLead(baseInput);

    expect(result.referenceNumber).toMatch(/^LIC-/);
    expect(leadCreateMock).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          leadType: 'licitacion',
          channel: 'formulario',
          expedienteRef: 'EXP-2026-001',
        }),
      }),
    );
    expect(projectCreateMock).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          expedienteRef: 'EXP-2026-001',
        }),
      }),
    );
    expect(sendLeadConfirmationMock).toHaveBeenCalledWith(
      expect.objectContaining({
        serviceName: 'Solicitud de licitación',
      }),
    );
    expect(recordConversionEventMock).toHaveBeenCalledWith(
      expect.objectContaining({
        eventName: 'generate_lead',
        leadId: 'lead-1',
        leadType: 'licitacion',
        value: 250000,
      }),
    );
  });

  it('fallo de generate_lead no rompe el alta', async () => {
    recordConversionEventMock.mockRejectedValue(new Error('db down'));

    const { createTenderLead } = await import('@/lib/leads/create-tender-lead');
    const result = await createTenderLead(baseInput);
    expect(result.leadId).toBe('lead-1');
  });

  it('slug provincia desconocido → 400', async () => {
    provinceFindMock.mockResolvedValue(null);

    const { createTenderLead } = await import('@/lib/leads/create-tender-lead');
    await expect(
      createTenderLead({ ...baseInput, provincia: 'no-existe' }),
    ).rejects.toMatchObject({
      code: 'VALIDATION_ERROR',
      status: 400,
    });
  });
});
