'use client';

import { useActionState, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/atoms/Button';
import { Input } from '@/components/atoms/Input';
import { FieldError } from '@/components/molecules/FieldError';
import { FormField } from '@/components/molecules/FormField';
import { loginAction } from '@/lib/auth/login-action';
import { resolveLoginCallbackUrl } from '@/lib/auth/login-callback-url';
import { type LoginActionResult } from '@/lib/auth/login-schemas';
import {
  validateLoginFormFields,
  type LoginFormFieldErrors,
} from '@/lib/auth/validate-login-form';

type Props = {
  callbackUrl: string;
  authErrorMessage?: string | null;
};

const initialActionState: LoginActionResult | null = null;

export function LoginForm({ callbackUrl, authErrorMessage }: Props) {
  const router = useRouter();
  const [fieldErrors, setFieldErrors] = useState<LoginFormFieldErrors>({});
  const [state, formAction, pending] = useActionState(
    async (_prev: LoginActionResult | null, formData: FormData) => {
      const validation = validateLoginFormFields({
        email: String(formData.get('email') ?? ''),
        password: String(formData.get('password') ?? ''),
        totp:
          String(formData.get('totp') ?? '').length > 0
            ? String(formData.get('totp'))
            : undefined,
      });

      if (!validation.ok) {
        setFieldErrors(validation.errors);
        return {
          ok: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Los datos del formulario no son válidos',
          },
        } as LoginActionResult;
      }

      setFieldErrors({});
      return loginAction(formData);
    },
    initialActionState,
  );

  useEffect(() => {
    if (state?.ok) {
      router.replace(resolveLoginCallbackUrl(callbackUrl));
      router.refresh();
    }
  }, [state, callbackUrl, router]);

  const bannerMessage =
    state && !state.ok
      ? state.error.message
      : authErrorMessage ?? null;

  const bannerIsRateLimit =
    state && !state.ok && state.error.code === 'RATE_LIMITED';

  return (
    <section aria-labelledby="login-heading" className="rounded-lg bg-brand-surface p-6 shadow-card sm:p-8">
      <header className="mb-6 space-y-2">
        <h1 id="login-heading" className="text-headline-sm font-semibold text-brand-primary">
          Iniciar sesión
        </h1>
        <p className="text-sm text-brand-secondary">
          Introduce tus credenciales de acceso al portal interno.
        </p>
      </header>

      {bannerMessage ? (
        <div
          role="alert"
          className={
            bannerIsRateLimit
              ? 'mb-4 rounded-sm border border-brand-error/30 bg-brand-error/5 px-3 py-2 text-sm text-brand-error'
              : 'mb-4 rounded-sm border border-brand-error/30 bg-brand-error/5 px-3 py-2 text-sm text-brand-error'
          }
        >
          {bannerMessage}
        </div>
      ) : null}

      <form action={formAction} className="space-y-4" aria-busy={pending}>
        <input type="hidden" name="callbackUrl" value={callbackUrl} />

        <FormField id="login-email" label="Email" required>
          <Input
            id="login-email"
            name="email"
            type="email"
            autoComplete="email"
            required
            disabled={pending}
            aria-invalid={fieldErrors.email ? true : undefined}
            aria-describedby={
              fieldErrors.email ? 'login-email-error' : undefined
            }
          />
          <FieldError id="login-email-error">{fieldErrors.email}</FieldError>
        </FormField>

        <FormField id="login-password" label="Contraseña" required>
          <Input
            id="login-password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            minLength={8}
            disabled={pending}
            aria-invalid={fieldErrors.password ? true : undefined}
            aria-describedby={
              fieldErrors.password ? 'login-password-error' : undefined
            }
          />
          <FieldError id="login-password-error">{fieldErrors.password}</FieldError>
        </FormField>

        <FormField
          id="login-totp"
          label="Código de verificación (2FA)"
          hint="Si tienes verificación en dos pasos activada, introduce también tu código de 6 dígitos."
        >
          <Input
            id="login-totp"
            name="totp"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            disabled={pending}
            aria-invalid={fieldErrors.totp ? true : undefined}
            aria-describedby={
              fieldErrors.totp
                ? 'login-totp-error login-totp-hint'
                : 'login-totp-hint'
            }
          />
          <FieldError id="login-totp-error">{fieldErrors.totp}</FieldError>
        </FormField>

        <Button type="submit" className="w-full" loading={pending} disabled={pending}>
          Entrar al portal
        </Button>
      </form>

      <p className="mt-6 text-xs text-brand-secondary">
        Si no reconoces este acceso, contacta con el administrador del sistema.
      </p>
    </section>
  );
}
