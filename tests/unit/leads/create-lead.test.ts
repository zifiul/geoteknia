/**
 * GTK-28 — createBudgetLead (caso de uso).
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('server-only', () => ({}));

const sendLeadConfirmationMock = vi.fn();

vi.mock('@/lib/email', () => ({
  sendLeadConfirmation: (...args: unknown[]) => sendLeadConfirmationMock(...args),
}));

const transactionMock = vi.fn();
const serviceFindMock = vi.fn();
const provinceFindMock = vi.fn();
const workTypologyFindMock = vi.fn();
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

import type { BudgetLeadInput } from '@/lib/leads/schema';

const baseInput: BudgetLeadInput = {
  servicio: 'edificacion-residencial',
  provincia: 'madrid',
  nombre: 'Ana López',
  email: 'ana@empresa.com',
  telefono: '612345678',
  rol: 'promotor',
  gdprConsent: true,
  turnstileToken: 'ts-token',
};

function buildTx() {
  return {
    service: { findFirst: serviceFindMock },
    province: { findFirst: provinceFindMock },
    workTypology: { findFirst: workTypologyFindMock },
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

describe('createBudgetLead (GTK-28)', () => {
  beforeEach(() => {
    vi.resetModules();
    sendLeadConfirmationMock.mockReset();
    sendLeadConfirmationMock.mockResolvedValue({ ok: true, id: 'email-1' });
    transactionMock.mockReset();
    serviceFindMock.mockReset();
    provinceFindMock.mockReset();
    workTypologyFindMock.mockReset();
    contactFindMock.mockReset();
    contactCreateMock.mockReset();
    contactUpdateMock.mockReset();
    leadFindUniqueMock.mockReset();
    leadCreateMock.mockReset();
    projectCreateMock.mockReset();
    projectStateFindMock.mockReset();

    serviceFindMock.mockResolvedValue({
      id: 'svc-1',
      name: 'Edificación',
      slug: 'edificacion-residencial',
    });
    provinceFindMock.mockResolvedValue({
      id: 'prov-1',
      name: 'Madrid',
      slug: 'madrid',
    });
    projectStateFindMock.mockResolvedValue({ id: 'state-1' });
    contactFindMock.mockResolvedValue(null);
    contactCreateMock.mockResolvedValue({ id: 'contact-1' });
    leadFindUniqueMock.mockResolvedValue(null);
    leadCreateMock.mockResolvedValue({ id: 'lead-1' });
    projectCreateMock.mockResolvedValue({ id: 'proj-1' });

    transactionMock.mockImplementation(async (fn) => fn(buildTx()));
  });

  it('camino feliz crea contact, lead y project', async () => {
    const { createBudgetLead } = await import('@/lib/leads/create-lead');
    const result = await createBudgetLead(baseInput);

    expect(result.referenceNumber).toMatch(/^PRE-/);
    expect(leadCreateMock).toHaveBeenCalled();
    expect(projectCreateMock).toHaveBeenCalled();
    expect(sendLeadConfirmationMock).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'ana@empresa.com',
        serviceName: 'Edificación',
        province: 'Madrid',
      }),
    );
  });

  it('reutiliza contacto existente por email', async () => {
    contactFindMock.mockResolvedValue({
      id: 'existing',
      fullName: 'Ana',
      email: 'ana@empresa.com',
      phone: null,
      company: null,
      professionalRole: null,
      provinceId: null,
    });
    contactUpdateMock.mockResolvedValue({ id: 'existing' });

    const { createBudgetLead } = await import('@/lib/leads/create-lead');
    await createBudgetLead(baseInput);

    expect(contactCreateMock).not.toHaveBeenCalled();
    expect(contactUpdateMock).toHaveBeenCalled();
  });

  it('slug de servicio desconocido → LeadCaptureError 400', async () => {
    serviceFindMock.mockResolvedValue(null);

    const { createBudgetLead } = await import('@/lib/leads/create-lead');
    await expect(createBudgetLead(baseInput)).rejects.toMatchObject({
      code: 'VALIDATION_ERROR',
      status: 400,
    });
    expect(sendLeadConfirmationMock).not.toHaveBeenCalled();
  });

  it('fallo de email no impide resultado del caso de uso', async () => {
    sendLeadConfirmationMock.mockResolvedValue({ ok: false, error: 'resend down' });

    const { createBudgetLead } = await import('@/lib/leads/create-lead');
    const result = await createBudgetLead(baseInput);
    expect(result.leadId).toBe('lead-1');
  });
});
