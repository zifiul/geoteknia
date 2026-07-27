/**
 * GTK-65 — validación cliente con locationLeadSchema (espejo del widget).
 */
import { describe, expect, it } from 'vitest';

import { locationLeadSchema } from '@/lib/leads/schema';

const turnstile = { gdprConsent: true as const, turnstileToken: 'ts' };

describe('GTK-65 location widget validation (locationLeadSchema)', () => {
  it('catastral solo + email', () => {
    const r = locationLeadSchema.safeParse({
      cadastralRef: '1234567DF1234N0001WX',
      email: 'campo@example.com',
      ...turnstile,
    });
    expect(r.success).toBe(true);
  });

  it('coords solas + teléfono', () => {
    const r = locationLeadSchema.safeParse({
      mapLat: 40.4168,
      mapLng: -3.7038,
      telefono: '612345678',
      ...turnstile,
    });
    expect(r.success).toBe(true);
  });

  it('catastral y coords juntas', () => {
    const r = locationLeadSchema.safeParse({
      cadastralRef: 'REF-1',
      mapLat: 40,
      mapLng: -3,
      email: 'a@b.com',
      ...turnstile,
    });
    expect(r.success).toBe(true);
  });

  it('sin ubicación → error', () => {
    const r = locationLeadSchema.safeParse({
      email: 'a@b.com',
      ...turnstile,
    });
    expect(r.success).toBe(false);
  });

  it('email solo sin teléfono → ok', () => {
    const r = locationLeadSchema.safeParse({
      cadastralRef: 'X',
      email: 'solo@example.com',
      ...turnstile,
    });
    expect(r.success).toBe(true);
  });

  it('teléfono solo sin email → ok', () => {
    const r = locationLeadSchema.safeParse({
      cadastralRef: 'X',
      telefono: '612345678',
      ...turnstile,
    });
    expect(r.success).toBe(true);
  });

  it('sin email ni teléfono → error', () => {
    const r = locationLeadSchema.safeParse({
      cadastralRef: 'X',
      ...turnstile,
    });
    expect(r.success).toBe(false);
  });
});
