import 'server-only';

import { AuditAction } from '@prisma/client';

import { recordAudit } from '@/lib/audit/log';
import type { PortalSessionPayload } from '@/lib/auth/session';

export async function recordAccessDeniedAudit(
  user: PortalSessionPayload,
  pathname: string,
): Promise<void> {
  try {
    await recordAudit({
      userId: user.userId,
      action: AuditAction.access_denied,
      entityType: 'admin_route',
      entityId: null,
      metadata: {
        pathname,
        roleName: user.roleName,
      },
    });
  } catch {
    // best-effort — no bloquear el 403
  }
}
