import { WorkflowStatus } from '@prisma/client';
import { z } from 'zod';

import { editorialContentTypeSchema } from '@/lib/content/schemas/workflow';
import { CMS_SILOS } from '@/lib/admin/cms-content-types';

export const cmsFiltersSchema = z
  .object({
    type: editorialContentTypeSchema.optional(),
    status: z.nativeEnum(WorkflowStatus).optional(),
    silo: z.enum(CMS_SILOS).optional(),
    page: z.coerce.number().int().positive().default(1),
    pageSize: z.coerce.number().int().positive().max(50).default(25),
  })
  .strict();

export type CmsFilters = z.infer<typeof cmsFiltersSchema>;

function firstSearchParam(
  value: string | string[] | undefined,
): string | undefined {
  if (value === undefined) {
    return undefined;
  }
  return Array.isArray(value) ? value[0] : value;
}

/** Parsea search params de RSC `/contenido`. */
export function parseCmsFiltersFromSearchParams(
  searchParams: Record<string, string | string[] | undefined>,
): CmsFilters {
  const typeRaw = firstSearchParam(searchParams.type);
  const statusRaw = firstSearchParam(searchParams.status);
  const siloRaw = firstSearchParam(searchParams.silo);

  const typeParsed =
    typeRaw && editorialContentTypeSchema.safeParse(typeRaw).success
      ? typeRaw
      : undefined;
  const statusParsed =
    statusRaw && statusRaw in WorkflowStatus ? statusRaw : undefined;
  const siloParsed =
    siloRaw && (CMS_SILOS as readonly string[]).includes(siloRaw)
      ? siloRaw
      : undefined;

  return cmsFiltersSchema.parse({
    type: typeParsed,
    status: statusParsed,
    silo: siloParsed,
    page: firstSearchParam(searchParams.page),
    pageSize: firstSearchParam(searchParams.pageSize),
  });
}
