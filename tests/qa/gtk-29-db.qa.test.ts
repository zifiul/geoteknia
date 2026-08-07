/**
 * QA GTK-29 — persistencia real BD (Docker local / Neon).
 */
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';

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

import { loadTestEnv } from '../helpers/test-env';

import { PrismaClient } from '@prisma/client';

import { createLocationLead } from '@/lib/leads/create-location-lead';

const TEST_PHONE = '699000029';
const db = new PrismaClient();

describe('QA GTK-29 — BD ubicación', () => {
  let baseline: {
    contacts: number;
    leads: number;
    projects: number;
    events: number;
  };
  let referenceNumber: string | null = null;

  beforeAll(async () => {
    loadTestEnv();

    sendLeadConfirmationMock.mockResolvedValue({ ok: true, id: 'qa-email' });
    recordConversionEventMock.mockResolvedValue({ id: 'qa-evt' });

    baseline = {
      contacts: await db.contact.count(),
      leads: await db.lead.count(),
      projects: await db.project.count(),
      events: await db.conversionEvent.count(),
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
      where: { phone: TEST_PHONE, deletedAt: null },
    });
    if (contact) {
      await db.contact.delete({ where: { id: contact.id } });
    }
    await db.$disconnect();
  });

  it('createLocationLead solo teléfono incrementa filas y usa UBI-', async () => {
    const result = await createLocationLead({
      cadastralRef: 'GTK29-QA-REF',
      telefono: TEST_PHONE,
      gdprConsent: true,
      turnstileToken: 'qa-unused',
    });

    referenceNumber = result.referenceNumber;
    expect(referenceNumber).toMatch(/^UBI-/);

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
      include: { project: true },
    });
    expect(lead?.leadType).toBe('ubicacion');
    expect(lead?.channel).toBe('ubicacion');
    expect(lead?.cadastralRef).toBe('GTK29-QA-REF');
    expect(lead?.project?.title).toMatch(/^Ubicación/);
    expect(sendLeadConfirmationMock).not.toHaveBeenCalled();
    expect(recordConversionEventMock).toHaveBeenCalledWith(
      expect.objectContaining({ eventName: 'send_location' }),
    );

    const restored = {
      contacts: await db.contact.count(),
      leads: await db.lead.count(),
      projects: await db.project.count(),
    };
    expect(restored.contacts).toBe(after.contacts);
  });
});
