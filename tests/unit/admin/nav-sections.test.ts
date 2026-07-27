/**
 * GTK-68 — filtrado de navegación admin por rol (función pura).
 */
import { RoleName } from '@prisma/client';
import { describe, expect, it } from 'vitest';

import {
  ADMIN_NAV_SECTIONS,
  filterNavSectionsForRole,
} from '@/lib/admin/nav-sections';
import {
  resolveRequiredPermissionForPath,
  userCanAccessPath,
} from '@/lib/admin/route-access';

describe('lib/admin/nav-sections', () => {
  it('admin ve todas las secciones con permiso', () => {
    const sections = filterNavSectionsForRole(RoleName.admin);
    const hrefs = sections.map((s) => s.href);
    expect(hrefs).toContain('/admin/usuarios');
    expect(hrefs).toContain('/contenido');
    expect(hrefs.length).toBe(ADMIN_NAV_SECTIONS.length);
  });

  it('técnico no ve contenido ni usuarios', () => {
    const sections = filterNavSectionsForRole(RoleName.tecnico);
    const hrefs = sections.map((s) => s.href);
    expect(hrefs).not.toContain('/contenido');
    expect(hrefs).not.toContain('/admin/usuarios');
    expect(hrefs).toContain('/admin/proyectos');
  });

  it('editor no ve proyectos ni usuarios', () => {
    const sections = filterNavSectionsForRole(RoleName.editor);
    const hrefs = sections.map((s) => s.href);
    expect(hrefs).not.toContain('/admin/proyectos');
    expect(hrefs).not.toContain('/admin/usuarios');
    expect(hrefs).toContain('/contenido');
  });
});

describe('lib/admin/route-access', () => {
  it('resuelve permiso de proyectos', () => {
    expect(resolveRequiredPermissionForPath('/admin/proyectos/abc')).toBe(
      'projects.read',
    );
  });

  it('técnico puede acceder a proyectos', () => {
    expect(
      userCanAccessPath({ roleName: RoleName.tecnico }, '/admin/proyectos'),
    ).toBe(true);
  });

  it('editor no puede acceder a proyectos', () => {
    expect(
      userCanAccessPath({ roleName: RoleName.editor }, '/admin/proyectos'),
    ).toBe(false);
  });
});
