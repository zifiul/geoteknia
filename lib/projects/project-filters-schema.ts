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

/** Parsea search params de RSC admin en filtros validados. */
export function parseProjectFiltersFromSearchParams(
  searchParams: Record<string, string | string[] | undefined>,
): ProjectFilters {
  return projectFiltersSchema.parse({
    stateSlug: firstSearchParam(searchParams.stateSlug),
    technicianId: firstSearchParam(searchParams.technicianId),
    serviceSlug: firstSearchParam(searchParams.serviceSlug),
    provinceSlug: firstSearchParam(searchParams.provinceSlug),
    from: firstSearchParam(searchParams.from),
    to: firstSearchParam(searchParams.to),
    page: firstSearchParam(searchParams.page),
    pageSize: firstSearchParam(searchParams.pageSize),
  });
}
