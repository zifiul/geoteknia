import type { AuditAction } from '@prisma/client';

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
