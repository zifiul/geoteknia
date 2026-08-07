/**
 * QA GTK-28 — persistencia real BD (Docker local / Neon).
 */
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';

vi.mock('server-only', () => ({}));

const sendLeadConfirmationMock = vi.fn();

vi.mock('@/lib/email', () => ({
  sendLeadConfirmation: (...args: unknown[]) => sendLeadConfirmationMock(...args),
}));

import { loadTestEnv } from '../helpers/test-env';

import { PrismaClient } from '@prisma/client';

import { createBudgetLead } from '@/lib/leads/create-lead';

const TEST_EMAIL = 'gtk28-qa@test.geoteknia.local';
const QA_SERVICE_SLUG = 'gtk28-qa-servicio';
const db = new PrismaClient();

describe('QA GTK-28 — BD presupuesto', () => {
  let baseline: { contacts: number; leads: number; projects: number };
  let referenceNumber: string | null = null;
  let qaServiceId: string | null = null;
  let provinceSlug: string | null = null;

  beforeAll(async () => {
    loadTestEnv();

    sendLeadConfirmationMock.mockResolvedValue({ ok: true, id: 'qa-email' });

    const province = await db.province.findFirst({
      where: { slug: 'madrid', deletedAt: null },
    });
    if (!province) {
      throw new Error('Seed de provincias requerido (madrid)');
    }
    provinceSlug = province.slug;

    const service = await db.service.upsert({
      where: { slug: QA_SERVICE_SLUG },
      create: {
        slug: QA_SERVICE_SLUG,
        name: 'Servicio QA GTK-28',
        body: 'Cuerpo mínimo para prueba de captación.',
        schemaType: 'Service',
      },
      update: {},
    });
    qaServiceId = service.id;

    baseline = {
      contacts: await db.contact.count(),
      leads: await db.lead.count(),
      projects: await db.project.count(),
    };
  });

  afterAll(async () => {
    if (referenceNumber) {
      const lead = await db.lead.findUnique({
        where: { referenceNumber },
        include: { project: true },
      });
      if (lead) {
        await db.conversionEvent.deleteMany({ where: { leadId: lead.id } });
      }
      if (lead?.project) {
        await db.project.delete({ where: { id: lead.project.id } });
      }
      if (lead) {
        await db.lead.delete({ where: { id: lead.id } });
      }
    }
    const contact = await db.contact.findFirst({
      where: { email: TEST_EMAIL, deletedAt: null },
    });
    if (contact) {
      await db.contact.delete({ where: { id: contact.id } });
    }
    if (qaServiceId) {
      await db.service.delete({ where: { id: qaServiceId } }).catch(() => {});
    }
    await db.$disconnect();
  });

  it('createBudgetLead incrementa contact+lead+project y restaura', async () => {
    const result = await createBudgetLead({
      servicio: QA_SERVICE_SLUG,
      provincia: provinceSlug!,
      nombre: 'QA GTK-28',
      email: TEST_EMAIL,
      telefono: '699000028',
      rol: 'otro',
      gdprConsent: true,
      turnstileToken: 'qa-unused',
    });

    referenceNumber = result.referenceNumber;
    expect(referenceNumber).toMatch(/^PRE-/);

    const after = {
      contacts: await db.contact.count(),
      leads: await db.lead.count(),
      projects: await db.project.count(),
    };

    expect(after.contacts).toBe(baseline.contacts + 1);
    expect(after.leads).toBe(baseline.leads + 1);
    expect(after.projects).toBe(baseline.projects + 1);

    const lead = await db.lead.findUnique({
      where: { referenceNumber },
      include: { project: { include: { state: true } } },
    });
    expect(lead?.leadType).toBe('presupuesto');
    expect(lead?.project?.state?.slug).toBe('lead-nuevo');
    expect(sendLeadConfirmationMock).toHaveBeenCalled();
  });
});
