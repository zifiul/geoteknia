import { RoleName } from '@prisma/client';
import { z } from 'zod';
export const userFiltersSchema = z
  .object({
    role: z.nativeEnum(RoleName).optional(),
    active: z.boolean().optional(),
    q: z.string().trim().min(1).max(200).optional(),
    page: z.coerce.number().int().positive().default(1),
    pageSize: z.coerce.number().int().positive().max(50).default(25),
    sort: z.enum(['fullName', 'createdAt']).default('fullName'),
  })
  .strict();

export type UserFilters = z.infer<typeof userFiltersSchema>;

function firstSearchParam(
  value: string | string[] | undefined,
): string | undefined {
  if (value === undefined) {
    return undefined;
  }
  return Array.isArray(value) ? value[0] : value;
}

function parseOptionalBoolean(
  value: string | string[] | undefined,
): boolean | undefined {
  const raw = firstSearchParam(value);
  if (raw === 'true') return true;
  if (raw === 'false') return false;
  return undefined;
}

/** Parsea search params de RSC admin en filtros validados. */
export function parseUserFiltersFromSearchParams(
  searchParams: Record<string, string | string[] | undefined>,
): UserFilters {
  const roleRaw = firstSearchParam(searchParams.role);
  return userFiltersSchema.parse({
    role: roleRaw && roleRaw in RoleName ? roleRaw : undefined,
    active: parseOptionalBoolean(searchParams.active),
    q: firstSearchParam(searchParams.q),
    page: firstSearchParam(searchParams.page),
    pageSize: firstSearchParam(searchParams.pageSize),
    sort: firstSearchParam(searchParams.sort),
  });
}
