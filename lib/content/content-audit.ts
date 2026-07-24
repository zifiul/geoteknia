import 'server-only';

import { AuditAction, type Prisma } from '@prisma/client';

import { recordAudit } from '@/lib/audit/log';
import type { PortalSessionPayload } from '@/lib/auth/session';

export async function recordContentUpdateAudit(
  tx: Prisma.TransactionClient,
  user: PortalSessionPayload,
  params: {
    entityType: string;
    entityId: string;
    entitySlug?: string;
    contentType?: string;
  },
): Promise<void> {
  await recordAudit(
    {
      userId: user.userId,
      action: AuditAction.content_update,
      entityType: params.entityType,
      entityId: params.entityId,
      metadata: {
        entitySlug: params.entitySlug,
        contentType: params.contentType ?? params.entityType,
      },
    },
    { tx },
  );
}

export async function recordContentDeleteAudit(
  tx: Prisma.TransactionClient,
  user: PortalSessionPayload,
  params: {
    entityType: string;
    entityId: string;
    entitySlug?: string;
  },
): Promise<void> {
  await recordAudit(
    {
      userId: user.userId,
      action: AuditAction.delete,
      entityType: params.entityType,
      entityId: params.entityId,
      metadata: {
        entitySlug: params.entitySlug,
        softDelete: true,
        contentType: params.entityType,
      },
    },
    { tx },
  );
}
