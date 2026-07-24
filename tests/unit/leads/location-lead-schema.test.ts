/**
 * GTK-29 — locationLeadSchema.
 */
import { describe, expect, it } from 'vitest';

import { locationLeadSchema } from '@/lib/leads/schema';

const base = {
  cadastralRef: '1234567DF1234N0001WX',
  email: 'obra@example.com',
  gdprConsent: true as const,
  turnstileToken: 'ts',
};

describe('locationLeadSchema (GTK-29)', () => {
  it('acepta catastral + email', () => {
    const r = locationLeadSchema.safeParse(base);
    expect(r.success).toBe(true);
  });

  it('acepta mapLat/mapLng + teléfono sin email', () => {
    const r = locationLeadSchema.safeParse({
      mapLat: 40.4168,
      mapLng: -3.7038,
      telefono: '612345678',
      gdprConsent: true,
      turnstileToken: 'ts',
    });
    expect(r.success).toBe(true);
  });

  it('rechaza sin ubicación', () => {
    const r = locationLeadSchema.safeParse({
      email: 'a@b.com',
      gdprConsent: true,
      turnstileToken: 'ts',
    });
    expect(r.success).toBe(false);
  });

  it('rechaza sin email ni teléfono', () => {
    const r = locationLeadSchema.safeParse({
      cadastralRef: 'REF',
      gdprConsent: true,
      turnstileToken: 'ts',
    });
    expect(r.success).toBe(false);
  });

  it('rechaza lat sin lng', () => {
    const r = locationLeadSchema.safeParse({
      mapLat: 40,
      telefono: '612345678',
      gdprConsent: true,
      turnstileToken: 'ts',
    });
    expect(r.success).toBe(false);
  });

  it('rechaza coordenadas fuera de rango', () => {
    const r = locationLeadSchema.safeParse({
      mapLat: 91,
      mapLng: 0,
      telefono: '612345678',
      gdprConsent: true,
      turnstileToken: 'ts',
    });
    expect(r.success).toBe(false);
  });

  it('SEC-2: rechaza claves extra (strict)', () => {
    const r = locationLeadSchema.safeParse({ ...base, extra: true });
    expect(r.success).toBe(false);
  });
});
