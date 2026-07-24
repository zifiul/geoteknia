/**
 * GTK-31 — tenderLeadSchema.
 */
import { describe, expect, it } from 'vitest';

import { tenderLeadSchema } from '@/lib/leads/schema';

const base = {
  nombre: 'Ana López',
  empresa: 'Constructora SA',
  email: 'licitacion@example.com',
  expedienteRef: 'EXP-2026-001',
  gdprConsent: true as const,
  turnstileToken: 'ts',
};

describe('tenderLeadSchema (GTK-31)', () => {
  it('acepta expedienteRef + contacto corporativo', () => {
    const r = tenderLeadSchema.safeParse(base);
    expect(r.success).toBe(true);
  });

  it('acepta plataformaUrl sin expedienteRef', () => {
    const r = tenderLeadSchema.safeParse({
      nombre: 'Ana López',
      empresa: 'Constructora SA',
      email: 'licitacion@example.com',
      plataformaUrl: 'https://contrataciondelestado.es/exp/1',
      gdprConsent: true,
      turnstileToken: 'ts',
    });
    expect(r.success).toBe(true);
  });

  it('rechaza sin expediente ni plataforma', () => {
    const r = tenderLeadSchema.safeParse({
      nombre: 'Ana López',
      empresa: 'Constructora SA',
      email: 'licitacion@example.com',
      gdprConsent: true,
      turnstileToken: 'ts',
    });
    expect(r.success).toBe(false);
  });

  it('rechaza sin gdprConsent true', () => {
    const r = tenderLeadSchema.safeParse({
      ...base,
      gdprConsent: false,
    });
    expect(r.success).toBe(false);
  });

  it('SEC-31: rechaza claves extra (strict)', () => {
    const r = tenderLeadSchema.safeParse({ ...base, extra: true });
    expect(r.success).toBe(false);
  });
});
