/**
 * QA GTK-30 — persistencia real BD (Docker local / Neon).
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

import { createResourceLead } from '@/lib/leads/create-resource-lead';

const TEST_EMAIL = 'gtk30-qa@example.com';
const db = new PrismaClient();

describe('QA GTK-30 — BD descarga de lead magnet gated', { timeout: 30000 }, () => {
  let baseline: {
    contacts: number;
    leads: number;
    projects: number;
    events: number;
  };
  let referenceNumber: string | null = null;
  let testLeadMagnetId: string | null = null;
  let testMediaId: string | null = null;

  beforeAll(async () => {
    loadTestEnv();

    sendLeadConfirmationMock.mockResolvedValue({ ok: true, id: 'qa-res-email' });
    recordConversionEventMock.mockResolvedValue({ id: 'qa-res-evt' });

    // Crear un LeadMagnet de prueba para asociar la FK
    const media = await db.mediaAsset.create({
      data: {
        fileUrl: '/uploads/qa-test.pdf',
        mimeType: 'application/pdf',
        fileSizeKb: 1024,
        assetType: 'pdf',
      },
    });
    testMediaId = media.id;

    const uniqueSlug = `guia-qa-gtk-30-${Date.now()}`;
    const lm = await db.leadMagnet.create({
      data: {
        title: 'Guía QA GTK-30',
        slug: uniqueSlug,
        thankYouUrl: `/recursos/${uniqueSlug}/gracias`,
        isGated: true,
        fileId: media.id,
        schemaType: 'CreativeWork',
      },
    });
    testLeadMagnetId = lm.id;

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
      where: { email: TEST_EMAIL, deletedAt: null },
    });
    if (contact) {
      await db.contact.delete({ where: { id: contact.id } });
    }
    if (testLeadMagnetId) {
      await db.leadMagnet.delete({ where: { id: testLeadMagnetId } });
    }
    if (testMediaId) {
      await db.mediaAsset.delete({ where: { id: testMediaId } });
    }
    await db.$disconnect();
  });

  it('createResourceLead incrementa filas, vincula leadMagnetId y crea project con prefijo', async () => {
    const result = await createResourceLead(
      {
        nombre: 'QA GTK30',
        empresa: 'QA Resource Corp',
        email: TEST_EMAIL,
        gdprConsent: true,
        turnstileToken: 'qa-unused',
      },
      {
        id: testLeadMagnetId!,
        title: 'Guía QA GTK-30',
        slug: 'guia-qa-gtk-30',
        thankYouUrl: '/recursos/guia-qa-gtk-30/gracias',
        fileId: testMediaId!,
        serviceId: null,
      },
    );

    referenceNumber = result.referenceNumber;
    expect(referenceNumber).toMatch(/^REC-/);
    expect(result.thankYouUrl).toBe('/recursos/guia-qa-gtk-30/gracias');

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

    expect(lead?.leadType).toBe('recurso');
    expect(lead?.channel).toBe('lead_magnet');
    expect(lead?.leadMagnetId).toBe(testLeadMagnetId);
    expect(lead?.project?.title).toContain('Recurso: Guía QA GTK-30');

    expect(recordConversionEventMock).toHaveBeenCalledWith(
      expect.objectContaining({
        eventName: 'resource_download',
        leadType: 'recurso',
      }),
    );
  });
});
