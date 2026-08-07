import type { AuditAction } from '@prisma/client';

/** Opción de filtro por actor en auditoría. */
export type AuditActorFilterOption = {
  id: string;
  label: string;
};

/** Opción de filtro por entidad en auditoría. */
export type AuditEntityFilterOption = {
  key: string;
  label: string;
  entityType: string;
  entityId: string;
};

/** Forma serializable del detalle de auditoría (RSC → cliente). */
export type AuditEventDetail = {
  id: string;
  createdAt: Date;
  action: AuditAction;
  entityType: string | null;
  entityId: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  metadata: unknown;
  userId: string | null;
  user: { fullName: string } | null;
};
