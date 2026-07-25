/**
 * GTK-30 — createResourceLead (caso de uso de captura de lead magnet gated).
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('server-only', () => ({}));

const sendLeadConfirmationMock = vi.fn();
const recordConversionEventMock = vi.fn();

vi.mock('@/lib/email', () => ({
  sendLeadConfirmation: (...args: unknown[]) => sendLeadConfirmationMock(...args),
}));

vi.mock('@/lib/analytics/record-event', () => ({
  recordConversionEvent: (...args: unknown[]) => recordConversionEventMock(...args),
}));

const transactionMock = vi.fn();
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

import type { ResourceLeadInput } from '@/lib/leads/schema';

const sampleInput: ResourceLeadInput = {
  nombre: 'Laura Martínez',
  email: 'laura@ingenieria.es',
  empresa: 'Constructora Beta',
  telefono: '611223344',
  rol: 'ingenieria',
  gdprConsent: true,
  turnstileToken: 'turnstile-valid',
};

const sampleLeadMagnet = {
  id: 'lm-11111111-1111-4111-8111-111111111111',
  title: 'Guía de Geotecnia 2026',
  slug: 'guia-geotecnia-2026',
  thankYouUrl: '/recursos/guia-geotecnia-2026/gracias',
  fileId: 'media-99999999-9999-4999-8999-999999999999',
  serviceId: null,
};

function buildTx() {
  return {
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

describe('createResourceLead (GTK-30)', () => {
  beforeEach(() => {
    vi.resetModules();
    sendLeadConfirmationMock.mockReset();
    sendLeadConfirmationMock.mockResolvedValue({ ok: true, id: 'email-res-1' });
    recordConversionEventMock.mockReset();
    recordConversionEventMock.mockResolvedValue({ id: 'evt-res-1' });
    transactionMock.mockReset();
    contactFindMock.mockResolvedValue(null);
    contactCreateMock.mockResolvedValue({ id: 'contact-res-1' });
    leadFindUniqueMock.mockResolvedValue(null);
    leadCreateMock.mockResolvedValue({ id: 'lead-res-1' });
    projectCreateMock.mockResolvedValue({ id: 'proj-res-1' });
    projectStateFindMock.mockResolvedValue({ id: 'state-initial-1' });

    transactionMock.mockImplementation(async (fn) => fn(buildTx()));
  });

  it('camino feliz con prefijo REC-, lead_type recurso, channel lead_magnet y event resource_download', async () => {
    const { createResourceLead } = await import('@/lib/leads/create-resource-lead');
    const result = await createResourceLead(sampleInput, sampleLeadMagnet);

    expect(result.referenceNumber).toMatch(/^REC-/);
    expect(result.thankYouUrl).toBe(sampleLeadMagnet.thankYouUrl);
    expect(result.downloadUrl).toContain('/api/recursos/download?token=');

    expect(leadCreateMock).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          leadType: 'recurso',
          channel: 'lead_magnet',
          leadMagnetId: sampleLeadMagnet.id,
        }),
      }),
    );

    expect(projectCreateMock).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          title: expect.stringContaining('Recurso:'),
        }),
      }),
    );

    expect(sendLeadConfirmationMock).toHaveBeenCalledWith(
      expect.objectContaining({
        serviceName: sampleLeadMagnet.title,
        province: 'Por determinar',
      }),
    );

    expect(recordConversionEventMock).toHaveBeenCalledWith(
      expect.objectContaining({
        eventName: 'resource_download',
        leadId: 'lead-res-1',
        leadType: 'recurso',
      }),
    );
  });

  it('fallo de recordConversionEvent no interrumpe la respuesta', async () => {
    recordConversionEventMock.mockRejectedValue(new Error('telemetry failed'));

    const { createResourceLead } = await import('@/lib/leads/create-resource-lead');
    const result = await createResourceLead(sampleInput, sampleLeadMagnet);

    expect(result.leadId).toBe('lead-res-1');
  });
});
