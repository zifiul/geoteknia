import type { RoleName } from '@prisma/client';

import { ROLES } from '@/lib/auth/permissions';

export type RoleOption = {
  id: string;
  name: RoleName;
  label: string;
};

/** Etiqueta canónica de UI para un rol (tests + RoleSelect). */
export function roleLabelForName(name: RoleName): string {
  return ROLES.find((r) => r.name === name)?.label ?? name;
}
