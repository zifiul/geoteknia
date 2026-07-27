import type { RoleName } from '@prisma/client';

import { filterNavSectionsForRole } from '@/lib/admin/nav-sections';
import { resolvePermissionCodesForRole } from '@/lib/auth/permissions';
import type { PortalSessionPayload } from '@/lib/auth/session';

export type RouteAccessRule = {
  /** Prefijo de pathname (más específico primero en la lista). */
  prefix: string;
  requiredPermission: string | null;
};

/** Reglas de acceso por ruta del portal (GTK-68). */
export const PORTAL_ROUTE_ACCESS_RULES: readonly RouteAccessRule[] = [
  { prefix: '/admin/proyectos', requiredPermission: 'projects.read' },
  { prefix: '/admin/usuarios', requiredPermission: 'users.read' },
  { prefix: '/contenido', requiredPermission: 'content.read' },
  { prefix: '/ia/', requiredPermission: 'ai.read' },
  { prefix: '/admin', requiredPermission: null },
  { prefix: '/perfil', requiredPermission: null },
] as const;

export function resolveRequiredPermissionForPath(
  pathname: string,
): string | null {
  const normalized =
    pathname.length > 1 && pathname.endsWith('/')
      ? pathname.slice(0, -1)
      : pathname;

  for (const rule of PORTAL_ROUTE_ACCESS_RULES) {
    if (
      normalized === rule.prefix ||
      normalized.startsWith(`${rule.prefix}/`)
    ) {
      return rule.requiredPermission;
    }
  }

  return null;
}

export function userCanAccessPath(
  user: Pick<PortalSessionPayload, 'roleName'>,
  pathname: string,
): boolean {
  const required = resolveRequiredPermissionForPath(pathname);
  if (required === null) {
    return true;
  }
  const granted = resolvePermissionCodesForRole(user.roleName);
  return granted.includes(required);
}

export function findFallbackNavHref(roleName: RoleName): string {
  const sections = filterNavSectionsForRole(roleName);
  const first = sections.find((s) => s.href !== '/admin');
  return first?.href ?? '/admin';
}
