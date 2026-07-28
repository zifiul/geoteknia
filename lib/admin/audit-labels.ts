import type { AuditAction } from '@prisma/client';

/** Etiquetas legibles para filtros y badges (compartido cliente/servidor). */
export const AUDIT_ACTION_LABELS: Record<AuditAction, string> = {
  publish: 'Publicación',
  approve: 'Aprobación',
  reject: 'Rechazo',
  delete: 'Eliminación',
  login: 'Inicio de sesión',
  login_failed: 'Login fallido',
  access_denied: 'Acceso denegado',
  role_change: 'Cambio de rol',
  ai_generate: 'Generación IA',
  export: 'Exportación',
  state_change: 'Cambio de estado',
  assign: 'Asignación',
  content_update: 'Actualización contenido',
  ai_config_update: 'Config. IA',
};
