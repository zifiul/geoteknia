import 'server-only';

import type { AuditAction, Prisma } from '@prisma/client';
import { z } from 'zod';

import { db } from '@/lib/db';

import { AUDIT_ACTION_VALUES, isMustAuditAction } from './actions';
import { sanitizeAuditMetadata } from './sanitize';

export class AuditValidationError extends Error {
  constructor(cause: z.ZodError) {
    super('Entrada de audit log inválida');
    this.name = 'AuditValidationError';
    this.cause = cause;
  }
}

export class AuditPersistenceError extends Error {
  readonly action: AuditAction;

  constructor(action: AuditAction, cause: unknown) {
    super(`No se pudo persistir audit log para acción crítica: ${action}`);
    this.name = 'AuditPersistenceError';
    this.action = action;
    this.cause = cause;
  }
}

const recordAuditInputSchema = z.object({
  userId: z.uuid().nullable(),
  action: z.enum(AUDIT_ACTION_VALUES),
  entityType: z.string().min(1).max(100).nullable().optional(),
  entityId: z.uuid().nullable().optional(),
  ip: z.string().max(45).nullable().optional(),
  userAgent: z.string().max(512).nullable().optional(),
  metadata: z.record(z.string(), z.unknown()).nullable().optional(),
});

export type RecordAuditInput = z.infer<typeof recordAuditInputSchema>;

export type RecordAuditOptions = {
  /** Cliente transaccional Prisma para acciones mustAudit en la misma TX de negocio. */
  tx?: Prisma.TransactionClient;
};

type AuditDbClient = Pick<typeof db, 'auditLog'>;

/**
 * Registra una acción sensible en audit_logs (append-only).
 *
 * - Acciones mustAudit: propaga error si falla la persistencia.
 * - Acciones best-effort: retorna null y registra el fallo sin bloquear negocio.
 */
export async function recordAudit(
  input: RecordAuditInput,
  options?: RecordAuditOptions,
): Promise<{ id: string } | null> {
  const parsed = recordAuditInputSchema.safeParse(input);
  if (!parsed.success) {
    throw new AuditValidationError(parsed.error);
  }

  const {
    userId,
    action,
    entityType = null,
    entityId = null,
    ip = null,
    userAgent = null,
    metadata = null,
  } = parsed.data;

  const sanitizedMetadata =
    metadata !== null ? sanitizeAuditMetadata(action, metadata) : null;

  const client: AuditDbClient = options?.tx ?? db;

  try {
    const row = await client.auditLog.create({
      data: {
        userId,
        action,
        entityType,
        entityId,
        ipAddress: ip,
        userAgent,
        metadata: (sanitizedMetadata ?? undefined) as Prisma.InputJsonValue | undefined,
      },
    });

    return { id: row.id };
  } catch (error) {
    if (isMustAuditAction(action)) {
      throw new AuditPersistenceError(action, error);
    }

    console.error('[audit] best-effort write failed', {
      action,
      entityType,
      entityId,
    });
    return null;
  }
}
