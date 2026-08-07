import { ADMIN_NAV_SECTIONS } from '@/lib/admin/nav-sections';

const SEGMENT_LABELS: Record<string, string> = {
  admin: 'Admin',
  proyectos: 'Proyectos',
  usuarios: 'Usuarios',
  auditoria: 'Auditoría',
  contenido: 'Contenido',
  ia: 'IA y costes',
  presupuesto: 'IA y costes',
  perfil: 'Perfil',
  seguridad: 'Seguridad',
  nuevo: 'Nuevo',
};

/** Título de contexto para la topbar del portal (breadcrumb Stitch). */
export function resolveAdminBreadcrumb(pathname: string): string {
  if (pathname === '/admin' || pathname === '/admin/') {
    return 'Dashboard';
  }

  const navMatch = ADMIN_NAV_SECTIONS.find((section) => {
    if (section.href === '/admin') return false;
    return pathname === section.href || pathname.startsWith(`${section.href}/`);
  });
  if (navMatch) {
    return navMatch.label;
  }

  const segments = pathname.split('/').filter(Boolean);
  const last = segments[segments.length - 1];
  if (last && SEGMENT_LABELS[last]) {
    return SEGMENT_LABELS[last];
  }

  return 'Portal';
}
