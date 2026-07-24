/**
 * QA GTK-32 — persistencia real Neon (db-state-verify) sobre conversion_events.
 */
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';

vi.mock('server-only', () => ({}));

import { PrismaClient } from '@prisma/client';

import {
  recordConversionEvent,
  recordConversionEvents,
} from '@/lib/analytics/record-event';

const db = new PrismaClient();
const MARKER_SESSION = 'gtk32-qa-session';

describe('QA GTK-32 — BD conversion_events', () => {
  let baseline: number;
  const createdIds: string[] = [];

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

    baseline = await db.conversionEvent.count();
  });

  afterAll(async () => {
    if (createdIds.length > 0) {
      await db.conversionEvent.deleteMany({
        where: { id: { in: createdIds } },
      });
    }
    await db.conversionEvent.deleteMany({
      where: { sessionId: MARKER_SESSION },
    });
    await db.$disconnect();
  });

  it('recordConversionEvent inserta fila append-only y se restaura', async () => {
    const result = await recordConversionEvent({
      eventName: 'calculator_use',
      serviceSlug: 'edificacion-residencial',
      provinceSlug: 'madrid',
      sessionId: MARKER_SESSION,
      pageUrl: 'https://geoteknia.es/calc?utm=secret',
      leadId: '00000000-0000-4000-8000-000000000099',
    });

    expect(result).not.toBeNull();
    if (result) createdIds.push(result.id);

    const after = await db.conversionEvent.count();
    expect(after).toBe(baseline + 1);

    const row = await db.conversionEvent.findUnique({
      where: { id: result!.id },
    });
    expect(row?.eventName).toBe('calculator_use');
    expect(row?.leadId).toBeNull();
    expect(row?.pageUrl).toBe('https://geoteknia.es/calc');
    expect(row?.sessionId).toBe(MARKER_SESSION);
  });

  it('recordConversionEvents inserta lote', async () => {
    const before = await db.conversionEvent.count();
    const n = await recordConversionEvents([
      {
        eventName: 'click_tel',
        sessionId: MARKER_SESSION,
      },
      {
        eventName: 'click_whatsapp',
        sessionId: MARKER_SESSION,
      },
    ]);
    expect(n).toBe(2);
    expect(await db.conversionEvent.count()).toBe(before + 2);

    const rows = await db.conversionEvent.findMany({
      where: { sessionId: MARKER_SESSION, eventName: { in: ['click_tel', 'click_whatsapp'] } },
      select: { id: true },
    });
    createdIds.push(...rows.map((r) => r.id));
  });
});
