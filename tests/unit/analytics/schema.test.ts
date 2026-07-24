/**
 * GTK-32 — contrato Zod ingestSchema / conversionEventSchema (fase 2 congelada).
 */
import { describe, expect, it } from 'vitest';

import {
  CONVERSION_EVENT_NAME_VALUES,
  conversionEventSchema,
  ingestSchema,
  normalizeIngestEvents,
} from '@/lib/analytics/schema';

describe('conversionEventSchema (GTK-32)', () => {
  it('acepta eventName de los 8 valores del enum Prisma', () => {
    expect(CONVERSION_EVENT_NAME_VALUES).toHaveLength(8);
    for (const eventName of CONVERSION_EVENT_NAME_VALUES) {
      const parsed = conversionEventSchema.safeParse({ eventName });
      expect(parsed.success).toBe(true);
    }
  });

  it('SEC-1: rechaza eventName fuera del enum', () => {
    const parsed = conversionEventSchema.safeParse({ eventName: 'fake_event' });
    expect(parsed.success).toBe(false);
  });

  it('SEC-1: rechaza claves desconocidas (.strict)', () => {
    const parsed = conversionEventSchema.safeParse({
      eventName: 'click_tel',
      email: 'leak@example.com',
    });
    expect(parsed.success).toBe(false);
  });

  it('coerce value y formStep desde string; rechaza overflow', () => {
    const ok = conversionEventSchema.safeParse({
      eventName: 'generate_lead',
      value: '12.5',
      formStep: '3',
    });
    expect(ok.success).toBe(true);
    if (ok.success) {
      expect(ok.data.value).toBe(12.5);
      expect(ok.data.formStep).toBe(3);
    }

    const overflow = conversionEventSchema.safeParse({
      eventName: 'generate_lead',
      value: 1e11,
    });
    expect(overflow.success).toBe(false);

    const stepOverflow = conversionEventSchema.safeParse({
      eventName: 'scroll_depth',
      formStep: 51,
    });
    expect(stepOverflow.success).toBe(false);
  });
});

describe('ingestSchema (GTK-32)', () => {
  it('acepta evento suelto o lote 1–50', () => {
    expect(ingestSchema.safeParse({ eventName: 'calculator_use' }).success).toBe(
      true,
    );
    expect(
      ingestSchema.safeParse({
        events: [{ eventName: 'click_whatsapp' }, { eventName: 'click_email' }],
      }).success,
    ).toBe(true);
  });

  it('rechaza lote vacío o > 50', () => {
    expect(ingestSchema.safeParse({ events: [] }).success).toBe(false);
    const tooMany = {
      events: Array.from({ length: 51 }, () => ({ eventName: 'scroll_depth' as const })),
    };
    expect(ingestSchema.safeParse(tooMany).success).toBe(false);
  });

  it('normalizeIngestEvents unifica a array', () => {
    expect(
      normalizeIngestEvents({ eventName: 'send_location' }),
    ).toHaveLength(1);
    expect(
      normalizeIngestEvents({
        events: [
          { eventName: 'click_tel' },
          { eventName: 'click_email' },
        ],
      }),
    ).toHaveLength(2);
  });
});
