/**
 * GTK-32 — recordConversionEvent / recordConversionEvents (append-only, best-effort).
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('server-only', () => ({}));

const createMock = vi.fn();
const createManyMock = vi.fn();
const leadFindUniqueMock = vi.fn();

vi.mock('@/lib/db', () => ({
  db: {
    conversionEvent: {
      create: (...args: unknown[]) => createMock(...args),
      createMany: (...args: unknown[]) => createManyMock(...args),
    },
    lead: {
      findUnique: (...args: unknown[]) => leadFindUniqueMock(...args),
    },
  },
}));

describe('recordConversionEvent (GTK-32)', () => {
  beforeEach(() => {
    vi.resetModules();
    createMock.mockReset();
    createManyMock.mockReset();
    leadFindUniqueMock.mockReset();
    createMock.mockResolvedValue({ id: 'evt-1' });
    createManyMock.mockResolvedValue({ count: 2 });
    leadFindUniqueMock.mockResolvedValue({ id: 'lead-1' });
  });

  it('inserta evento válido sin occurredAt del cliente', async () => {
    const { recordConversionEvent } = await import('@/lib/analytics/record-event');
    const result = await recordConversionEvent({
      eventName: 'calculator_use',
      serviceSlug: 'edificacion-residencial',
      provinceSlug: 'madrid',
    });

    expect(result).toEqual({ id: 'evt-1' });
    expect(createMock).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.not.objectContaining({ occurredAt: expect.anything() }),
      }),
    );
    const data = createMock.mock.calls[0]?.[0]?.data as Record<string, unknown>;
    expect(data).not.toHaveProperty('occurredAt');
    expect(data.eventName).toBe('calculator_use');
  });

  it('SEC-3: pageUrl se persiste saneada (sin query)', async () => {
    const { recordConversionEvent } = await import('@/lib/analytics/record-event');
    await recordConversionEvent({
      eventName: 'click_tel',
      pageUrl: 'https://geoteknia.es/contacto?phone=612345678',
    });

    const data = createMock.mock.calls[0]?.[0]?.data as { pageUrl?: string };
    expect(data.pageUrl).toBe('https://geoteknia.es/contacto');
  });

  it('SEC-4: leadId inexistente se degrada a null (no lanza)', async () => {
    leadFindUniqueMock.mockResolvedValue(null);

    const { recordConversionEvent } = await import('@/lib/analytics/record-event');
    const result = await recordConversionEvent({
      eventName: 'generate_lead',
      leadId: '00000000-0000-4000-8000-000000000099',
    });

    expect(result).toEqual({ id: 'evt-1' });
    const data = createMock.mock.calls[0]?.[0]?.data as { leadId: string | null };
    expect(data.leadId).toBeNull();
  });

  it('best-effort: fallo de create → null sin lanzar', async () => {
    createMock.mockRejectedValue(new Error('db down'));

    const { recordConversionEvent } = await import('@/lib/analytics/record-event');
    await expect(
      recordConversionEvent({ eventName: 'scroll_depth' }),
    ).resolves.toBeNull();
  });

  it('recordConversionEvents inserta N filas vía createMany', async () => {
    const { recordConversionEvents } = await import('@/lib/analytics/record-event');
    const n = await recordConversionEvents([
      { eventName: 'click_tel' },
      { eventName: 'click_whatsapp' },
    ]);

    expect(n).toBe(2);
    expect(createManyMock).toHaveBeenCalled();
  });
});
