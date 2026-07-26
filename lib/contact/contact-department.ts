import type { ContactDepartment } from '@prisma/client';

import type { PublicContactChannel } from '@/lib/content/organization';

export function resolveContactDepartmentForPath(pathname: string): ContactDepartment | null {
  const path = pathname.split('?')[0] ?? pathname;
  if (path === '/licitaciones' || path.startsWith('/licitaciones/')) {
    return 'licitaciones';
  }
  if (path.startsWith('/servicios') || path.startsWith('/zonas')) {
    return 'presupuestos';
  }
  return null;
}

export type LayoutContactChannels = {
  general: PublicContactChannel | null;
  presupuestos: PublicContactChannel | null;
  licitaciones: PublicContactChannel | null;
};

export function resolveLayoutContactChannel(
  pathname: string,
  channels: LayoutContactChannels,
): { channel: PublicContactChannel | null; department: ContactDepartment | null } {
  const department = resolveContactDepartmentForPath(pathname);
  if (department === 'presupuestos') {
    return { channel: channels.presupuestos ?? channels.general, department };
  }
  if (department === 'licitaciones') {
    return { channel: channels.licitaciones ?? channels.general, department };
  }
  return { channel: channels.general, department: null };
}

export function contactDepartmentLabel(department: ContactDepartment | null): string {
  switch (department) {
    case 'presupuestos':
      return 'presupuestos';
    case 'direccion_tecnica':
      return 'dirección técnica';
    case 'licitaciones':
      return 'licitaciones';
    default:
      return 'Geoteknia';
  }
}
