import type { AuditAction } from '@prisma/client';

/** Valor especial de filtro para eventos sin actor (userId nulo). */
export const AUDIT_SYSTEM_ACTOR_ID = '__system__';

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

/** Etiquetas de tipo de entidad en audit_logs. */
export const AUDIT_ENTITY_TYPE_LABELS: Record<string, string> = {
  projects: 'Proyecto',
  project: 'Proyecto',
  project_note: 'Nota de proyecto',
  project_document: 'Documento de proyecto',
  users: 'Usuario',
  user: 'Usuario',
  service: 'Servicio',
  geo_zone: 'Zona geográfica',
  service_zone_page: 'Landing zona',
  case_study: 'Caso de estudio',
  blog_post: 'Artículo de blog',
  faq: 'FAQ',
  team_member: 'Miembro del equipo',
  machinery: 'Maquinaria',
  media_asset: 'Medio',
  accreditation: 'Acreditación',
  lead_magnet: 'Recurso descargable',
  admin_route: 'Ruta admin',
  ai_budget_config: 'Config. presupuesto IA',
  ai_generations: 'Generación IA',
};
