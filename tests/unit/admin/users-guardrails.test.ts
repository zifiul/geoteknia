import { describe, expect, it } from 'vitest';

import { createUserFormSchema } from '@/lib/admin/user-form-schemas';
import {
  assertActorNotSelfTarget,
  assertNotRemovingLastAdmin,
} from '@/lib/admin/users-guardrails';
import { roleLabelForName } from '@/lib/admin/users-role-labels';

describe('user-form-schemas', () => {
  it('rechaza email inválido', () => {
    const result = createUserFormSchema.safeParse({
      fullName: 'Test',
      email: 'no-email',
      roleId: '00000000-0000-4000-8000-000000000001',
    });
    expect(result.success).toBe(false);
  });

  it('acepta datos válidos', () => {
    const result = createUserFormSchema.safeParse({
      fullName: 'Ana López',
      email: 'ana@geoteknia.com',
      roleId: '00000000-0000-4000-8000-000000000001',
    });
    expect(result.success).toBe(true);
  });
});

describe('users-guardrails', () => {
  it('impide auto-desactivación', () => {
    expect(() =>
      assertActorNotSelfTarget('u1', 'u1', 'desactivar'),
    ).toThrow(/desactivar/);
  });

  it('impide quitar el último admin activo', () => {
    expect(() =>
      assertNotRemovingLastAdmin(
        { targetIsAdmin: true, targetIsActive: true, otherActiveAdminCount: 0 },
        'deactivate',
      ),
    ).toThrow(/administrador activo/);
  });

  it('permite desactivar si hay otro admin', () => {
    expect(() =>
      assertNotRemovingLastAdmin(
        { targetIsAdmin: true, targetIsActive: true, otherActiveAdminCount: 1 },
        'deactivate',
      ),
    ).not.toThrow();
  });
});

describe('users-role-labels', () => {
  it('mapea etiquetas canónicas de ROLES', () => {
    expect(roleLabelForName('gestor')).toBe('Gestor comercial');
  });
});
