'use server';

import { AuthError } from 'next-auth';

import { signIn } from '@/lib/auth/config';
import { readLoginClientIp } from '@/lib/auth/login-client-ip';
import { loginRateLimitResult } from '@/lib/auth/login-rate-limit';
import {
  LOGIN_INVALID_CREDENTIALS_MESSAGE,
  loginInputSchema,
  type LoginActionResult,
  type LoginInput,
} from '@/lib/auth/login-schemas';

export async function loginAction(input: LoginInput): Promise<LoginActionResult> {
  const ip = await readLoginClientIp();
  const rateLimited = loginRateLimitResult(ip);
  if (rateLimited) {
    return rateLimited;
  }

  const parsed = loginInputSchema.safeParse(input);

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
      ...(parsed.data.totp ? { totp: parsed.data.totp } : {}),
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
