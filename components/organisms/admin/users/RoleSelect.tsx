import type { RoleName } from '@prisma/client';

import { ROLES } from '@/lib/auth/permissions';

export type RoleOption = {
  id: string;
  name: RoleName;
  label: string;
};

type Props = {
  roles: RoleOption[];
  name?: string;
  id?: string;
  defaultValue?: string;
  required?: boolean;
  disabled?: boolean;
};

export function RoleSelect({
  roles,
  name = 'roleId',
  id = 'roleId',
  defaultValue,
  required = true,
  disabled = false,
}: Props) {
  const options = roles.map((role) => {
    const canonical = ROLES.find((r) => r.name === role.name);
    return {
      ...role,
      label: canonical?.label ?? role.label,
    };
  });

  return (
    <select
      id={id}
      name={name}
      required={required}
      disabled={disabled}
      defaultValue={defaultValue}
      className="mt-1 w-full rounded-md border border-brand-secondary/30 bg-brand-surface px-3 py-2 text-sm text-brand-on-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent"
    >
      <option value="">Selecciona un rol</option>
      {options.map((role) => (
        <option key={role.id} value={role.id}>
          {role.label}
        </option>
      ))}
    </select>
  );
}
