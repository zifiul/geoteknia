import 'server-only';

import { AuditAction } from '@prisma/client';

import type { RecordAuditInput } from '@/lib/audit/log';
import { recordAudit } from '@/lib/audit/log';

import type { LoginFailedAttemptReason } from '@/lib/auth/authenticate-credentials';

export type LoginAuditDeps = {
  recordAudit: typeof recordAudit;
};

export async function recordLoginSuccessAudit(
  params: {
    userId: string;
    roleName: string;
    ip?: string | null;
    userAgent?: string | null;
  },
  deps: LoginAuditDeps = { recordAudit },
): Promise<void> {
  await deps.recordAudit({
    userId: params.userId,
    action: AuditAction.login,
    entityType: 'users',
    entityId: params.userId,
    ip: params.ip ?? null,
    userAgent: params.userAgent ?? null,
    metadata: { method: 'credentials', roleName: params.roleName },
  } satisfies RecordAuditInput);
}

export async function recordLoginFailedAudit(
  params: {
    userId: string | null;
    attemptReason: LoginFailedAttemptReason;
    ip?: string | null;
    userAgent?: string | null;
  },
  deps: LoginAuditDeps = { recordAudit },
): Promise<void> {
  await deps.recordAudit({
    userId: params.userId,
    action: AuditAction.login_failed,
    entityType: 'users',
    entityId: params.userId,
    ip: params.ip ?? null,
    userAgent: params.userAgent ?? null,
    metadata: {
      method: 'credentials',
      attemptReason: params.attemptReason,
    },
  } satisfies RecordAuditInput);
}
