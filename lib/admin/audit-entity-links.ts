import { EDITORIAL_CONTENT_TYPES } from '@/lib/content/schemas/workflow';

/**
 * Destino admin para entidad auditada. Contenido editorial sin enlace hasta GTK-73.
 */
export function resolveAuditEntityHref(
  entityType: string | null | undefined,
  entityId: string | null | undefined,
): string | null {
  if (!entityType || !entityId) {
    return null;
  }

  if (entityType === 'projects') {
    return `/admin/proyectos/${entityId}`;
  }

  if ((EDITORIAL_CONTENT_TYPES as readonly string[]).includes(entityType)) {
    return null;
  }

  return null;
}
