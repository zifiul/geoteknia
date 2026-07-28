import { AuditAction } from '@prisma/client';
import { z } from 'zod';

const uuidSchema = z.string().uuid();

export const auditFiltersSchema = z
  .object({
    action: z.nativeEnum(AuditAction).optional(),
    userId: z.string().uuid().optional(),
    entityType: z.string().trim().min(1).max(64).optional(),
    entityId: z.string().uuid().optional(),
    from: z.coerce.date().optional(),
    to: z.coerce.date().optional(),
    page: z.coerce.number().int().positive().default(1),
    pageSize: z.coerce.number().int().positive().max(50).default(25),
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
    const path = issue.path.length > 0 ? issue.path.join('.') : 'filtros';
    return `${path}: ${issue.message}`;
  });
}

/** Parsea search params de RSC admin; UUID/fechas inválidos → errores sin lanzar. */
export function parseAuditFiltersFromSearchParams(
  searchParams: Record<string, string | string[] | undefined>,
): AuditFiltersParseResult {
  const actionRaw = firstSearchParam(searchParams.action);
  const action =
    actionRaw && actionRaw in AuditAction
      ? (actionRaw as AuditAction)
      : actionRaw
        ? '__invalid__'
        : undefined;

  const raw = {
    action: action === '__invalid__' ? 'invalid_action' : action,
    userId: firstSearchParam(searchParams.userId),
    entityType: firstSearchParam(searchParams.entityType),
    entityId: firstSearchParam(searchParams.entityId),
    from: firstSearchParam(searchParams.from),
    to: firstSearchParam(searchParams.to),
    page: firstSearchParam(searchParams.page),
    pageSize: firstSearchParam(searchParams.pageSize),
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
