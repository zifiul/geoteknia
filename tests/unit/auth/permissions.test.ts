import { describe, expect, it } from 'vitest';
import {
  PERMISSIONS,
  assertRbacMatrixIntegrity,
  resolvePermissionCodesForRole,
} from '@/lib/auth/permissions';

describe('lib/auth/permissions — matriz RBAC canónica (GTK-17)', () => {
  it('admin tiene todos los permisos atómicos', () => {
    const codes = resolvePermissionCodesForRole('admin');
    expect(codes).toHaveLength(PERMISSIONS.length);
    expect(new Set(codes)).toEqual(new Set(PERMISSIONS.map((p) => p.code)));
  });

  it('gestor tiene solo permisos projects.*', () => {
    const codes = resolvePermissionCodesForRole('gestor');
    expect(codes.length).toBeGreaterThan(0);
    expect(codes.every((c) => c.startsWith('projects.'))).toBe(true);
  });

  it('editor tiene content.* y ai.generate', () => {
    const codes = resolvePermissionCodesForRole('editor');
    expect(codes.every((c) => c.startsWith('content.') || c === 'ai.generate')).toBe(
      true,
    );
    expect(codes).toContain('ai.generate');
    expect(codes).toContain('content.publish');
  });

  it('tecnico tiene únicamente projects.read', () => {
    expect(resolvePermissionCodesForRole('tecnico')).toEqual(['projects.read']);
  });

  it('pasa la validación de integridad de la matriz', () => {
    expect(() => assertRbacMatrixIntegrity()).not.toThrow();
  });
});
