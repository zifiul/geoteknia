'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/atoms/Button';
import { RoleSelect, type RoleOption } from '@/components/organisms/admin/users/RoleSelect';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/molecules/Dialog';
import { createUserFormSchema } from '@/lib/admin/user-form-schemas';
import { createUserAction } from '@/lib/admin/users-actions';

type Props = {
  roles: RoleOption[];
};

export function CreateUserForm({ roles }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [tempPassword, setTempPassword] = useState<string | null>(null);
  const [createdUserId, setCreatedUserId] = useState<string | null>(null);

  function handleSubmit(formData: FormData) {
    setFormError(null);
    setFieldErrors({});
    const raw = {
      fullName: String(formData.get('fullName') ?? ''),
      email: String(formData.get('email') ?? ''),
      roleId: String(formData.get('roleId') ?? ''),
    };
    const parsed = createUserFormSchema.safeParse(raw);
    if (!parsed.success) {
      const next: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0];
        if (typeof key === 'string' && !next[key]) {
          next[key] = issue.message;
        }
      }
      setFieldErrors(next);
      return;
    }

    startTransition(async () => {
      const result = await createUserAction(formData);
      if (!result.ok) {
        setFormError(result.error.message);
        return;
      }
      if (result.data?.temporaryPassword && result.data.userId) {
        setTempPassword(result.data.temporaryPassword);
        setCreatedUserId(result.data.userId);
      }
    });
  }

  return (
    <>
      <form action={handleSubmit} className="mx-auto max-w-xl space-y-6 rounded-xl border border-brand-primary/10 bg-brand-surface p-6 shadow-sm">
        <div>
          <label htmlFor="fullName" className="block text-sm font-medium text-brand-primary">
            Nombre completo
          </label>
          <input
            id="fullName"
            name="fullName"
            required
            autoComplete="name"
            aria-invalid={Boolean(fieldErrors.fullName)}
            aria-describedby={fieldErrors.fullName ? 'fullName-error' : undefined}
            className="mt-1 w-full rounded-md border border-brand-secondary/30 px-3 py-2 text-sm"
          />
          {fieldErrors.fullName ? (
            <p id="fullName-error" className="mt-1 text-sm text-red-600" role="alert">
              {fieldErrors.fullName}
            </p>
          ) : null}
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-brand-primary">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="off"
            aria-invalid={Boolean(fieldErrors.email)}
            aria-describedby={fieldErrors.email ? 'email-error' : undefined}
            className="mt-1 w-full rounded-md border border-brand-secondary/30 px-3 py-2 text-sm"
          />
          {fieldErrors.email ? (
            <p id="email-error" className="mt-1 text-sm text-red-600" role="alert">
              {fieldErrors.email}
            </p>
          ) : null}
        </div>
        <div>
          <label htmlFor="roleId" className="block text-sm font-medium text-brand-primary">
            Rol
          </label>
          <RoleSelect roles={roles} />
          {fieldErrors.roleId ? (
            <p className="mt-1 text-sm text-red-600" role="alert">
              {fieldErrors.roleId}
            </p>
          ) : null}
        </div>
        {formError ? (
          <p className="text-sm text-red-600" role="alert">
            {formError}
          </p>
        ) : null}
        <Button type="submit" loading={pending}>
          Crear usuario
        </Button>
      </form>

      <TemporaryPasswordDialog
        open={tempPassword !== null}
        password={tempPassword ?? ''}
        onClose={() => {
          setTempPassword(null);
          if (createdUserId) {
            router.push(`/admin/usuarios/${createdUserId}`);
          } else {
            router.push('/admin/usuarios');
          }
          router.refresh();
        }}
        title="Usuario creado"
        description="Copia la contraseña temporal. No se volverá a mostrar."
      />
    </>
  );
}

type DialogProps = {
  open: boolean;
  password: string;
  title: string;
  description: string;
  onClose: () => void;
};

export function TemporaryPasswordDialog({
  open,
  password,
  title,
  description,
  onClose,
}: DialogProps) {
  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent aria-describedby="temp-password-desc">
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription id="temp-password-desc">{description}</DialogDescription>
        <p className="mt-4 rounded-md bg-brand-neutral px-4 py-3 font-mono text-sm break-all">
          {password}
        </p>
        <Button type="button" className="mt-4 w-full" onClick={onClose}>
          Entendido
        </Button>
      </DialogContent>
    </Dialog>
  );
}
