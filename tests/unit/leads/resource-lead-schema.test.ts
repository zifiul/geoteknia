/**
 * GTK-30 — resourceLeadSchema (validación de formulario de descarga lead magnet gated).
 */
import { describe, expect, it } from 'vitest';

import { resourceLeadSchema } from '@/lib/leads/schema';

const baseValidInput = {
  nombre: 'Carlos Ruiz',
  email: 'carlos.ruiz@ingenieria.es',
  empresa: 'Ingeniería Geotécnica S.L.',
  telefono: '600112233',
  rol: 'ingenieria',
  gdprConsent: true as const,
  turnstileToken: 'turnstile-valid-token',
};

describe('resourceLeadSchema (GTK-30)', () => {
  it('acepta un payload válido completo', () => {
    const result = resourceLeadSchema.safeParse(baseValidInput);
    expect(result.success).toBe(true);
  });

  it('acepta payload mínimo sin campos opcionales (empresa, teléfono, rol, utms)', () => {
    const minimal = {
      nombre: 'María García',
      email: 'maria@empresa.com',
      gdprConsent: true as const,
      turnstileToken: 'token-turnstile-min',
    };
    const result = resourceLeadSchema.safeParse(minimal);
    expect(result.success).toBe(true);
  });

  it('SEC: rechaza si gdprConsent no es true', () => {
    const result = resourceLeadSchema.safeParse({
      ...baseValidInput,
      gdprConsent: false,
    });
    expect(result.success).toBe(false);
  });

  it('SEC: rechaza si falta el turnstileToken', () => {
    const { turnstileToken, ...withoutToken } = baseValidInput;
    const result = resourceLeadSchema.safeParse(withoutToken);
    expect(result.success).toBe(false);
  });

  it('SEC: rechaza email con formato inválido', () => {
    const result = resourceLeadSchema.safeParse({
      ...baseValidInput,
      email: 'no-es-un-email',
    });
    expect(result.success).toBe(false);
  });

  it('SEC: rechaza claves extra desconocidas (.strict())', () => {
    const result = resourceLeadSchema.safeParse({
      ...baseValidInput,
      injectedField: 'hacked',
    });
    expect(result.success).toBe(false);
  });
});
