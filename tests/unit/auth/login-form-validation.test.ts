/**
 * GTK-69 — validación cliente del formulario de login.
 */
import { describe, expect, it } from 'vitest';

import { validateLoginFormFields } from '@/lib/auth/validate-login-form';

describe('validateLoginFormFields (GTK-69)', () => {
  it('acepta credenciales válidas sin TOTP', () => {
    const result = validateLoginFormFields({
      email: 'admin@geoteknia.local',
      password: 'correcthorse',
    });
    expect(result.ok).toBe(true);
  });

  it('rechaza email inválido', () => {
    const result = validateLoginFormFields({
      email: 'not-an-email',
      password: 'correcthorse',
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.email).toBeDefined();
    }
  });

  it('rechaza TOTP con formato inválido', () => {
    const result = validateLoginFormFields({
      email: 'a@b.co',
      password: '12345678',
      totp: '12ab56',
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.totp).toBeDefined();
    }
  });

  it('acepta TOTP de 6 dígitos', () => {
    const result = validateLoginFormFields({
      email: 'a@b.co',
      password: '12345678',
      totp: '123456',
    });
    expect(result.ok).toBe(true);
  });
});
