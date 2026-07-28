import type { RoleName } from '@prisma/client';
import { WorkflowStatus } from '@prisma/client';

export function buildCmsListHref(options?: {
  status?: WorkflowStatus;
}): string {
  const q = new URLSearchParams();
  if (options?.status) {
    q.set('status', options.status);
  }
  const query = q.toString();
  return query ? `/contenido?${query}` : '/contenido';
}

/** Enlace por defecto del dashboard GTK-79 tras GTK-72. */
export function defaultCmsListHrefForRole(roleName: RoleName): string {
  if (roleName === 'editor') {
    return buildCmsListHref({ status: WorkflowStatus.borrador_ia });
  }
  return '/contenido';
}
