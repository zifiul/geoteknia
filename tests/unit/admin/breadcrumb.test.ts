import { describe, expect, it } from 'vitest';

import { resolveAdminBreadcrumb } from '@/lib/admin/breadcrumb';

describe('resolveAdminBreadcrumb', () => {
  it('devuelve Dashboard en la home del portal', () => {
    expect(resolveAdminBreadcrumb('/admin')).toBe('Dashboard');
  });

  it('resuelve secciones principales del menú', () => {
    expect(resolveAdminBreadcrumb('/admin/proyectos')).toBe('Proyectos');
    expect(resolveAdminBreadcrumb('/contenido')).toBe('Contenido');
    expect(resolveAdminBreadcrumb('/admin/usuarios/nuevo')).toBe('Usuarios');
  });
});
