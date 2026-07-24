/**
 * QA GTK-29 — persistencia real Neon (db-state-verify).
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
    process.env.NODE_ENV ??= 'test';
    process.env.NEXTAUTH_URL ??= 'http://localhost:3000';
    process.env.NEXTAUTH_SECRET ??= 'local-qa-nextauth-secret-32chars-min';
    process.env.ANTHROPIC_API_KEY ??= 'sk-ant-local-qa-placeholder';
    process.env.TURNSTILE_SECRET_KEY ??=
      '1x0000000000000000000000000000000AA';
    process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ??=
      '1x00000000000000000000AA';
    process.env.RESEND_API_KEY ??= 're_test_qa';
    process.env.EMAIL_FROM ??= 'Geoteknia <noreply@test.geoteknia.com>';
    process.env.EMAIL_REPLY_TO ??= 'presupuestos@test.geoteknia.com';
    process.env.SESSION_TTL_MINUTES ??= '480';
    process.env.TWOFA_ENCRYPTION_KEY ??=
      'ffaf4fe2ce037ac6ece4f59cf18e5f5977b8bacdc90aa50ad245465716afbc5f';

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
