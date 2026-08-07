import { AuditAction } from '@prisma/client';
import { z } from 'zod';

import { AUDIT_SYSTEM_ACTOR_ID } from '@/lib/admin/audit-labels';

const uuidSchema = z.string().uuid({ message: 'Identificador no válido' });

const FIELD_LABELS: Record<string, string> = {
  action: 'Acción',
  userId: 'Usuario',
  entityType: 'Tipo de entidad',
  entityId: 'Entidad',
  from: 'Desde',
  to: 'Hasta',
  page: 'Página',
  pageSize: 'Por página',
};

function emptyToUndefined(value: string | undefined): string | undefined {
  if (value === undefined) {
    return undefined;
  }
  const trimmed = value.trim();
  return trimmed.length === 0 ? undefined : trimmed;
}

function parseOptionalDateParam(value: string | undefined): Date | undefined {
  const normalized = emptyToUndefined(value);
  if (!normalized) {
    return undefined;
  }
  const parsed = new Date(normalized);
  if (Number.isNaN(parsed.getTime())) {
    return undefined;
  }
  return parsed;
}

const optionalDateParam = z
  .date({ message: 'Fecha no válida' })
  .optional();

export const auditFiltersSchema = z
  .object({
    action: z.nativeEnum(AuditAction, { message: 'Acción no válida' }).optional(),
    userId: z
      .union([
        z.string().uuid({ message: 'Usuario no válido' }),
        z.literal(AUDIT_SYSTEM_ACTOR_ID),
      ])
      .optional(),
    entityType: z.string().trim().min(1).max(64).optional(),
    entityId: z.string().uuid({ message: 'Entidad no válida' }).optional(),
    from: optionalDateParam,
    to: optionalDateParam,
    page: z.coerce
      .number()
      .int({ message: 'Página no válida' })
      .positive({ message: 'Página no válida' })
      .default(1),
    pageSize: z.coerce
      .number()
      .int({ message: 'Tamaño de página no válido' })
      .positive({ message: 'Tamaño de página no válido' })
      .max(50, { message: 'Máximo 50 registros por página' })
      .default(25),
  })
  .strict()
  .superRefine((data, ctx) => {
    if (data.from && data.to && data.from > data.to) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'La fecha inicial debe ser anterior o igual a la final',
        path: ['to'],
      });
    }
  });

export type AuditFilters = z.infer<typeof auditFiltersSchema>;

export type AuditFiltersParseResult =
  | { ok: true; filters: AuditFilters }
  | { ok: false; filters: AuditFilters; fieldErrors: string[] };

function firstSearchParam(
  value: string | string[] | undefined,
): string | undefined {
  if (value === undefined) {
    return undefined;
  }
  return Array.isArray(value) ? value[0] : value;
}

const defaultFilters: AuditFilters = {
  page: 1,
  pageSize: 25,
};

function collectFieldErrors(error: z.ZodError): string[] {
  return error.issues.map((issue) => {
    const field = issue.path[0]?.toString();
    const label =
      field && FIELD_LABELS[field] ? FIELD_LABELS[field] : 'Filtros';
    return `${label}: ${issue.message}`;
  });
}

export function parseAuditEntityKey(
  entityKey: string | undefined,
): { entityType?: string; entityId?: string } {
  const normalized = emptyToUndefined(entityKey);
  if (!normalized) {
    return {};
  }

  const separator = normalized.indexOf(':');
  if (separator <= 0) {
    return {};
  }

  const entityType = normalized.slice(0, separator).trim();
  const entityId = normalized.slice(separator + 1).trim();
  if (!entityType || !uuidSchema.safeParse(entityId).success) {
    return {};
  }

  return { entityType, entityId };
}

/** Parsea search params de RSC admin; valores vacíos o inválidos → errores sin lanzar. */
export function parseAuditFiltersFromSearchParams(
  searchParams: Record<string, string | string[] | undefined>,
): AuditFiltersParseResult {
  const actionRaw = emptyToUndefined(firstSearchParam(searchParams.action));
  const action =
    actionRaw && actionRaw in AuditAction
      ? (actionRaw as AuditAction)
      : actionRaw
        ? '__invalid__'
        : undefined;

  const fromEntityKey = parseAuditEntityKey(
    firstSearchParam(searchParams.entityKey),
  );

  const raw = {
    action: action === '__invalid__' ? 'invalid_action' : action,
    userId: emptyToUndefined(firstSearchParam(searchParams.userId)),
    entityType:
      fromEntityKey.entityType ??
      emptyToUndefined(firstSearchParam(searchParams.entityType)),
    entityId:
      fromEntityKey.entityId ??
      emptyToUndefined(firstSearchParam(searchParams.entityId)),
    from: parseOptionalDateParam(firstSearchParam(searchParams.from)),
    to: parseOptionalDateParam(firstSearchParam(searchParams.to)),
    page: emptyToUndefined(firstSearchParam(searchParams.page)),
    pageSize: emptyToUndefined(firstSearchParam(searchParams.pageSize)),
  };

  const parsed = auditFiltersSchema.safeParse(raw);
  if (parsed.success) {
    return { ok: true, filters: parsed.data };
  }

  const partial = auditFiltersSchema.safeParse({
    page: raw.page,
    pageSize: raw.pageSize,
  });

  return {
    ok: false,
    filters: partial.success ? partial.data : defaultFilters,
    fieldErrors: collectFieldErrors(parsed.error),
  };
}

export { uuidSchema };
