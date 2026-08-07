import { z } from 'zod';

/** Filtros de listado/métricas del pipeline CRM (GTK-34). Contrato congelado fase 2. */
export const projectFiltersSchema = z
  .object({
    stateSlug: z.string().trim().min(1).optional(),
    technicianId: z.string().uuid().optional(),
    serviceSlug: z.string().trim().min(1).optional(),
    provinceSlug: z.string().trim().min(1).optional(),
    from: z.coerce.date().optional(),
    to: z.coerce.date().optional(),
    page: z.coerce.number().int().positive().default(1),
    pageSize: z.coerce.number().int().positive().max(100).default(20),
    slaOverdue: z.boolean().optional(),
  })
  .strict();

export type ProjectFilters = z.infer<typeof projectFiltersSchema>;

function firstSearchParam(
  value: string | string[] | undefined,
): string | undefined {
  if (value === undefined) {
    return undefined;
  }
  return Array.isArray(value) ? value[0] : value;
}

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

/** Parsea search params de RSC admin en filtros validados. */
export function parseProjectFiltersFromSearchParams(
  searchParams: Record<string, string | string[] | undefined>,
): ProjectFilters {
  return projectFiltersSchema.parse({
    stateSlug: emptyToUndefined(firstSearchParam(searchParams.stateSlug)),
    technicianId: emptyToUndefined(firstSearchParam(searchParams.technicianId)),
    serviceSlug: emptyToUndefined(firstSearchParam(searchParams.serviceSlug)),
    provinceSlug: emptyToUndefined(firstSearchParam(searchParams.provinceSlug)),
    from: parseOptionalDateParam(firstSearchParam(searchParams.from)),
    to: parseOptionalDateParam(firstSearchParam(searchParams.to)),
    page: firstSearchParam(searchParams.page),
    pageSize: firstSearchParam(searchParams.pageSize),
    slaOverdue: parseOptionalBoolean(searchParams.slaOverdue),
  });
}

function parseOptionalBoolean(
  value: string | string[] | undefined,
): boolean | undefined {
  const raw = firstSearchParam(value);
  if (raw === 'true') return true;
  if (raw === 'false') return false;
  return undefined;
}
