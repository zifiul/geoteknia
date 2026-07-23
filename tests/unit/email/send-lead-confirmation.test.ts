/**
 * Tests de lib/email/send-lead-confirmation.ts — GTK-27 / transactional-email-service spec.
 */
import { createElement } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('server-only', () => ({}));

const sendEmailMock = vi.fn();
const LeadConfirmationEmailMock = vi.fn(() => null);

vi.mock('@/lib/email/client', () => ({
  sendEmail: (...args: unknown[]) => sendEmailMock(...args),
}));

vi.mock('@/lib/email/templates/lead-confirmation-email', () => ({
  LeadConfirmationEmail: () => LeadConfirmationEmailMock(),
}));

vi.mock('@/lib/env', () => ({
  env: {
    RESEND_API_KEY: 're_test_key',
    EMAIL_FROM: 'Geoteknia <noreply@test.geoteknia.com>',
    EMAIL_REPLY_TO: 'presupuestos@test.geoteknia.com',
  },
}));

describe('lib/email/send-lead-confirmation — sendLeadConfirmation (GTK-27)', () => {
  beforeEach(async () => {
    vi.resetModules();
    sendEmailMock.mockReset();
    LeadConfirmationEmailMock.mockReset();
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(console, 'info').mockImplementation(() => {});

    const { clearLeadConfirmationRegistryForTests } = await import(
      '@/lib/email/idempotency'
    );
    clearLeadConfirmationRegistryForTests();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const validInput = {
    to: 'lead@empresa.com',
    referenceNumber: 'GT-2026-0042',
    technicianName: 'Ana García',
    serviceName: 'Estudio geotécnico',
    province: 'Madrid',
  };

  it('compone asunto y props de plantilla y envía con éxito', async () => {
    sendEmailMock.mockResolvedValue({ ok: true, id: 'resend-abc123' });

    const { sendLeadConfirmation } = await import(
      '@/lib/email/send-lead-confirmation'
    );
    const { buildLeadConfirmationSubject } = await import(
      '@/lib/email/templates/lead-confirmation'
    );
    const { LeadConfirmationEmail } = await import(
      '@/lib/email/templates/lead-confirmation-email'
    );

    const result = await sendLeadConfirmation(validInput);

    expect(result).toEqual({ ok: true, id: 'resend-abc123' });
    expect(sendEmailMock).toHaveBeenCalledOnce();

    const [call] = sendEmailMock.mock.calls;
    expect(call?.[0]).toMatchObject({
      to: 'lead@empresa.com',
      subject: buildLeadConfirmationSubject('GT-2026-0042'),
    });

    expect(call?.[0]?.react).toEqual(
      createElement(LeadConfirmationEmail, {
        referenceNumber: 'GT-2026-0042',
        technicianName: 'Ana García',
        serviceName: 'Estudio geotécnico',
        province: 'Madrid',
      }),
    );
  });

  it('usa fallback de técnico cuando technicianName es null', async () => {
    sendEmailMock.mockResolvedValue({ ok: true, id: 'resend-fallback' });

    const { sendLeadConfirmation } = await import(
      '@/lib/email/send-lead-confirmation'
    );
    const { TECHNICIAN_FALLBACK_COPY } = await import(
      '@/lib/email/templates/lead-confirmation'
    );
    const { LeadConfirmationEmail } = await import(
      '@/lib/email/templates/lead-confirmation-email'
    );

    await sendLeadConfirmation({
      ...validInput,
      technicianName: null,
    });

    expect(sendEmailMock.mock.calls[0]?.[0]?.react).toEqual(
      createElement(LeadConfirmationEmail, {
        referenceNumber: 'GT-2026-0042',
        technicianName: TECHNICIAN_FALLBACK_COPY,
        serviceName: 'Estudio geotécnico',
        province: 'Madrid',
      }),
    );
  });

  it('gestiona error de Resend sin lanzar excepción', async () => {
    sendEmailMock.mockResolvedValue({
      ok: false,
      error: 'Rate limit exceeded',
    });

    const { sendLeadConfirmation } = await import(
      '@/lib/email/send-lead-confirmation'
    );

    const result = await sendLeadConfirmation(validInput);

    expect(result).toEqual({ ok: false, error: 'Rate limit exceeded' });
    expect(console.error).toHaveBeenCalledWith(
      '[email] lead confirmation failed',
      expect.objectContaining({ referenceNumber: 'GT-2026-0042' }),
    );
  });

  it('es idempotente por referenceNumber ante reintentos', async () => {
    sendEmailMock.mockResolvedValue({ ok: true, id: 'resend-first' });

    const { sendLeadConfirmation } = await import(
      '@/lib/email/send-lead-confirmation'
    );

    const first = await sendLeadConfirmation(validInput);
    const second = await sendLeadConfirmation(validInput);

    expect(first).toEqual({ ok: true, id: 'resend-first' });
    expect(second).toEqual({
      ok: true,
      skipped: true,
      id: 'resend-first',
    });
    expect(sendEmailMock).toHaveBeenCalledOnce();
  });

  it('lanza LeadConfirmationValidationError con email inválido', async () => {
    const { sendLeadConfirmation, LeadConfirmationValidationError } =
      await import('@/lib/email/send-lead-confirmation');

    await expect(
      sendLeadConfirmation({ ...validInput, to: 'not-an-email' }),
    ).rejects.toBeInstanceOf(LeadConfirmationValidationError);
    expect(sendEmailMock).not.toHaveBeenCalled();
  });
});

describe('lib/email/templates/lead-confirmation — helpers (GTK-27)', () => {
  it('buildLeadConfirmationSubject incluye el número de referencia', async () => {
    const { buildLeadConfirmationSubject } = await import(
      '@/lib/email/templates/lead-confirmation'
    );

    expect(buildLeadConfirmationSubject('GT-99')).toBe(
      'Confirmación de solicitud — Ref. GT-99',
    );
  });

  it('resolveTechnicianDisplayName usa fallback para string vacío', async () => {
    const {
      resolveTechnicianDisplayName,
      TECHNICIAN_FALLBACK_COPY,
    } = await import('@/lib/email/templates/lead-confirmation');

    expect(resolveTechnicianDisplayName('  ')).toBe(TECHNICIAN_FALLBACK_COPY);
    expect(resolveTechnicianDisplayName(undefined)).toBe(
      TECHNICIAN_FALLBACK_COPY,
    );
    expect(resolveTechnicianDisplayName('Carlos Ruiz')).toBe('Carlos Ruiz');
  });
});
