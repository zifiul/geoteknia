import { z } from 'zod';

import { loginInputSchema } from '@/lib/auth/login-schemas';

const loginFormFieldsSchema = loginInputSchema;

export type LoginFormFields = z.infer<typeof loginFormFieldsSchema>;

export type LoginFormFieldErrors = Partial<
  Record<'email' | 'password' | 'totp', string>
>;

export function validateLoginFormFields(
  raw: LoginFormFields,
): { ok: true; data: LoginFormFields } | { ok: false; errors: LoginFormFieldErrors } {
  const parsed = loginFormFieldsSchema.safeParse(raw);
  if (parsed.success) {
    return { ok: true, data: parsed.data };
  }

  const errors: LoginFormFieldErrors = {};
  for (const issue of parsed.error.issues) {
    const key = issue.path[0];
    if (key === 'email' || key === 'password' || key === 'totp') {
      errors[key] = issue.message;
    }
  }
  return { ok: false, errors };
}
