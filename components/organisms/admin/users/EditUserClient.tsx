'use client';

import Link from 'next/link';
import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/atoms/Button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/molecules/Dialog';
import { TemporaryPasswordDialog } from '@/components/organisms/admin/users/CreateUserForm';
import { RoleSelect, type RoleOption } from '@/components/organisms/admin/users/RoleSelect';
import { UserStatusBadge } from '@/components/organisms/admin/users/UserStatusBadge';
import { updateUserFormSchema } from '@/lib/admin/user-form-schemas';
import type { UserDetail } from '@/lib/admin/users-queries';
import {
  resetUser2faAction,
  resetUserPasswordAction,
  setUserActiveAction,
  updateUserAction,
} from '@/lib/admin/users-actions';

type Props = {
  user: UserDetail;
  roles: RoleOption[];
};

export function EditUserClient({ user, roles }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [tempPassword, setTempPassword] = useState<string | null>(null);
  const [confirmDeactivate, setConfirmDeactivate] = useState(false);
  const [confirmResetPwd, setConfirmResetPwd] = useState(false);
  const [confirmReset2fa, setConfirmReset2fa] = useState(false);

  function handleUpdate(formData: FormData) {
    setError(null);
    setMessage(null);
    const raw = {
      fullName: String(formData.get('fullName') ?? ''),
      email: String(formData.get('email') ?? ''),
      roleId: String(formData.get('roleId') ?? ''),
    };
    const parsed = updateUserFormSchema.safeParse(raw);
    if (!parsed.success) {
      setError('Revisa los campos del formulario.');
      return;
    }
    startTransition(async () => {
      const result = await updateUserAction(user.id, formData);
      if (!result.ok) {
        setError(result.error.message);
        return;
      }
      setMessage('Usuario actualizado.');
      router.refresh();
    });
  }

  function runAction(
    fn: () => Promise<{ ok: boolean; error?: { message: string }; data?: { temporaryPassword?: string } }>,
    onSuccess?: () => void,
  ) {
    setError(null);
    setMessage(null);
    startTransition(async () => {
      const result = await fn();
      if (!result.ok) {
        setError(result.error?.message ?? 'Error al guardar');
        return;
      }
      if (result.data?.temporaryPassword) {
        setTempPassword(result.data.temporaryPassword);
      } else {
        setMessage('Operación completada.');
      }
      onSuccess?.();
      router.refresh();
    });
  }

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm text-brand-secondary">Usuario interno</p>
          <h1 className="text-2xl font-semibold text-brand-primary">{user.fullName}</h1>
          <UserStatusBadge isActive={user.isActive} twofaEnabled={user.twofaEnabled} />
        </div>
        {user.role.name === 'tecnico' ? (
          <Link
            href={`/admin/proyectos?technicianId=${user.id}`}
            className="text-sm font-medium text-brand-accent hover:underline"
          >
            Ver proyectos asignados
          </Link>
        ) : null}
      </header>

      <form
        action={handleUpdate}
        className="max-w-xl space-y-4 rounded-xl border border-brand-primary/10 bg-brand-surface p-6 shadow-sm"
      >
        <div>
          <label htmlFor="fullName" className="block text-sm font-medium text-brand-primary">
            Nombre completo
          </label>
          <input
            id="fullName"
            name="fullName"
            required
            defaultValue={user.fullName}
            className="mt-1 w-full rounded-md border border-brand-secondary/30 px-3 py-2 text-sm"
          />
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
            defaultValue={user.email}
            className="mt-1 w-full rounded-md border border-brand-secondary/30 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label htmlFor="roleId" className="block text-sm font-medium text-brand-primary">
            Rol
          </label>
          <RoleSelect roles={roles} defaultValue={user.roleId} />
        </div>
        {error ? (
          <p className="text-sm text-red-600" role="alert">
            {error}
          </p>
        ) : null}
        {message ? (
          <p className="text-sm text-emerald-700" role="status">
            {message}
          </p>
        ) : null}
        <Button type="submit" loading={pending}>
          Guardar cambios
        </Button>
      </form>

      <section
        aria-labelledby="danger-actions-heading"
        className="max-w-xl rounded-xl border border-red-200 bg-red-50/50 p-6"
      >
        <h2 id="danger-actions-heading" className="text-lg font-semibold text-brand-primary">
          Acciones sensibles
        </h2>
        <ul className="mt-4 flex flex-col gap-3">
          <li>
            <Button
              type="button"
              variant="outline"
              disabled={pending}
              onClick={() => setConfirmDeactivate(true)}
            >
              {user.isActive ? 'Desactivar usuario' : 'Reactivar usuario'}
            </Button>
          </li>
          <li>
            <Button
              type="button"
              variant="outline"
              disabled={pending}
              onClick={() => setConfirmResetPwd(true)}
            >
              Restablecer contraseña
            </Button>
          </li>
          {user.twofaEnabled ? (
            <li>
              <Button
                type="button"
                variant="outline"
                disabled={pending}
                onClick={() => setConfirmReset2fa(true)}
              >
                Restablecer 2FA
              </Button>
            </li>
          ) : null}
        </ul>
      </section>

      <ConfirmDialog
        open={confirmDeactivate}
        title={user.isActive ? 'Desactivar usuario' : 'Reactivar usuario'}
        description={
          user.isActive
            ? 'El usuario no podrá iniciar sesión hasta que se reactive.'
            : 'El usuario podrá volver a acceder al portal.'
        }
        confirmLabel={user.isActive ? 'Desactivar' : 'Reactivar'}
        onCancel={() => setConfirmDeactivate(false)}
        onConfirm={() => {
          setConfirmDeactivate(false);
          runAction(() => setUserActiveAction(user.id, !user.isActive));
        }}
      />

      <ConfirmDialog
        open={confirmResetPwd}
        title="Restablecer contraseña"
        description="Se generará una contraseña temporal nueva. Compártela de forma segura."
        confirmLabel="Generar contraseña"
        onCancel={() => setConfirmResetPwd(false)}
        onConfirm={() => {
          setConfirmResetPwd(false);
          runAction(() => resetUserPasswordAction(user.id));
        }}
      />

      <ConfirmDialog
        open={confirmReset2fa}
        title="Restablecer 2FA"
        description="Se eliminará el segundo factor del usuario. Deberá configurarlo de nuevo en su perfil."
        confirmLabel="Restablecer 2FA"
        onCancel={() => setConfirmReset2fa(false)}
        onConfirm={() => {
          setConfirmReset2fa(false);
          runAction(() => resetUser2faAction(user.id), () => setConfirmReset2fa(false));
        }}
      />

      <TemporaryPasswordDialog
        open={tempPassword !== null}
        password={tempPassword ?? ''}
        title="Contraseña temporal"
        description="Copia la contraseña. No se volverá a mostrar al recargar."
        onClose={() => setTempPassword(null)}
      />
    </div>
  );
}

type ConfirmProps = {
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
};

function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  onConfirm,
  onCancel,
}: ConfirmProps) {
  return (
    <Dialog open={open} onOpenChange={(next) => !next && onCancel()}>
      <DialogContent>
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription>{description}</DialogDescription>
        <div className="mt-6 flex flex-wrap justify-end gap-2">
          <Button type="button" variant="ghost" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="button" variant="primary" onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
