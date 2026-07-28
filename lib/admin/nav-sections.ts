import type { RoleName } from '@prisma/client';

import { resolvePermissionCodesForRole } from '@/lib/auth/permissions';

export type AdminNavSection = {
  href: string;
  label: string;
  /** Permiso mínimo para ver el enlace; null = cualquier usuario autenticado. */
  requiredPermission: string | null;
};

/** Secciones del portal ordenadas; permisos alineados con módulos RBAC (GTK-68). */
export const ADMIN_NAV_SECTIONS: readonly AdminNavSection[] = [
  { href: '/admin', label: 'Inicio', requiredPermission: null },
  {
    href: '/admin/proyectos',
    label: 'Proyectos',
    requiredPermission: 'projects.read',
  },
  {
    href: '/contenido',
    label: 'Contenido',
    requiredPermission: 'content.read',
  },
  {
    href: '/ia/presupuesto',
    label: 'IA y costes',
    requiredPermission: 'ai.read',
  },
  {
    href: '/admin/usuarios',
    label: 'Usuarios',
    requiredPermission: 'users.read',
  },
  {
    href: '/admin/auditoria',
    label: 'Auditoría',
    requiredPermission: 'audit.read',
  },
  {
    href: '/perfil/seguridad',
    label: 'Seguridad',
    requiredPermission: null,
  },
] as const;

export function filterNavSectionsForRole(roleName: RoleName): AdminNavSection[] {
  const granted = new Set(resolvePermissionCodesForRole(roleName));

  return ADMIN_NAV_SECTIONS.filter((section) => {
    if (section.requiredPermission === null) {
      return true;
    }
    return granted.has(section.requiredPermission);
  });
}
