'use server';

import { AuthError } from 'next-auth';

import { signIn } from '@/lib/auth/config';
import {
  LOGIN_INVALID_CREDENTIALS_MESSAGE,
  loginInputSchema,
  type LoginActionResult,
} from '@/lib/auth/login-schemas';

export async function loginAction(formData: FormData): Promise<LoginActionResult> {
  const totpRaw = formData.get('totp');
  const parsed = loginInputSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
    totp:
      typeof totpRaw === 'string' && totpRaw.length > 0 ? totpRaw : undefined,
  });

  if (!parsed.success) {
    return {
      ok: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Los datos del formulario no son válidos',
      },
    };
  }

  try {
    await signIn('credentials', {
      email: parsed.data.email,
      password: parsed.data.password,
      totp: parsed.data.totp,
      redirect: false,
    });
    return { ok: true };
  } catch (error) {
    if (error instanceof AuthError) {
      return {
        ok: false,
        error: {
          code: 'INVALID_CREDENTIALS',
          message: LOGIN_INVALID_CREDENTIALS_MESSAGE,
        },
      };
    }
    throw error;
  }
}
