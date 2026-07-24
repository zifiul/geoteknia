import { AuditAction } from '@prisma/client';

/** Valores canónicos alineados con el enum Prisma `AuditAction` (GTK-7 / DB-02). */
export const AUDIT_ACTION_VALUES = [
  'publish',
  'approve',
  'reject',
  'delete',
  'login',
  'login_failed',
  'role_change',
  'ai_generate',
  'export',
  'state_change',
  'assign',
  'content_update',
  'ai_config_update',
] as const satisfies readonly AuditAction[];

export type AuditActionValue = (typeof AUDIT_ACTION_VALUES)[number];

/**
 * Acciones críticas: un fallo al persistir audit log DEBE revertir la transacción
 * de negocio cuando se usa `{ tx }`.
 */
export const MUST_AUDIT_ACTIONS = new Set<AuditAction>([
  AuditAction.delete,
  AuditAction.publish,
  AuditAction.approve,
  AuditAction.role_change,
  AuditAction.state_change,
  AuditAction.assign,
  AuditAction.content_update,
  AuditAction.ai_config_update,
]);

/** Acciones informativas: best-effort — no bloquean la acción de negocio. */
export const BEST_EFFORT_AUDIT_ACTIONS = new Set<AuditAction>(
  AUDIT_ACTION_VALUES.filter((action) => !MUST_AUDIT_ACTIONS.has(action)),
);

export function isMustAuditAction(action: AuditAction): boolean {
  return MUST_AUDIT_ACTIONS.has(action);
}
