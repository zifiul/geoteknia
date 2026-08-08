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

function CopyPasswordIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}

export function TemporaryPasswordDialog({
  open,
  password,
  title,
  description,
  onClose,
}: DialogProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(password);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent aria-describedby="temp-password-desc">
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription id="temp-password-desc">{description}</DialogDescription>
        <div className="mt-4 flex items-start gap-2 rounded-md bg-brand-neutral px-3 py-2">
          <p className="min-w-0 flex-1 font-mono text-sm break-all">{password}</p>
          <button
            type="button"
            onClick={() => void handleCopy()}
            className="inline-flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-md text-brand-secondary transition-colors hover:bg-brand-surface hover:text-brand-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-accent"
            aria-label={copied ? 'Contraseña copiada' : 'Copiar contraseña'}
          >
            <CopyPasswordIcon className="size-5 shrink-0" />
          </button>
        </div>
        <p
          className="mt-1 min-h-5 text-center text-xs text-brand-secondary"
          aria-live="polite"
        >
          {copied ? 'Contraseña copiada al portapapeles' : null}
        </p>
        <Button type="button" className="mt-2 w-full" onClick={onClose}>
          Entendido
        </Button>
      </DialogContent>
    </Dialog>
  );
}
