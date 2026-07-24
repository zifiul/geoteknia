import { z } from 'zod';

import { totpCodeSchema } from '@/lib/auth/login-schemas';

/** Reexport del campo TOTP de 6 dígitos (login + gestión 2FA). */
export { totpCodeSchema } from '@/lib/auth/login-schemas';

/** Contraseña para reautenticación en desactivación de 2FA (mismos límites que login). */
export const passwordReauthSchema = z.string().min(8).max(128);

/**
 * Entrada de `confirmTotpActivationAction`.
 * SEC-6: objeto estricto — claves extra rechazadas.
 */
export const confirmTotpActivationInputSchema = z
  .object({
    totp: totpCodeSchema,
  })
  .strict();

export type ConfirmTotpActivationInput = z.infer<
  typeof confirmTotpActivationInputSchema
>;

/**
 * Entrada de `disableTotpAction`.
 * SEC-6: objeto estricto — claves extra rechazadas.
 */
export const disableTotpInputSchema = z
  .object({
    password: passwordReauthSchema,
    totp: totpCodeSchema,
  })
  .strict();

export type DisableTotpInput = z.infer<typeof disableTotpInputSchema>;

export const totpActionErrorCodeSchema = z.enum([
  'UNAUTHORIZED',
  'VALIDATION_ERROR',
  'INVALID_TOTP',
  'FORBIDDEN',
  'CONFLICT',
]);

export type TotpActionErrorCode = z.infer<typeof totpActionErrorCodeSchema>;

const totpActionErrorSchema = z
  .object({
    code: totpActionErrorCodeSchema,
    message: z.string().max(500),
  })
  .strict();

const totpActionFailureSchema = z
  .object({
    ok: z.literal(false),
    error: totpActionErrorSchema,
  })
  .strict();

/** Resultado de acciones TOTP sin payload extra en éxito. */
export const totpVoidActionResultSchema = z.discriminatedUnion('ok', [
  z.object({ ok: z.literal(true) }),
  totpActionFailureSchema,
]);

export type TotpVoidActionResult = z.infer<typeof totpVoidActionResultSchema>;

const otpauthUriSchema = z
  .string()
  .min(10)
  .max(4096)
  .refine((value) => value.startsWith('otpauth://'), {
    message: 'URI otpauth inválida',
  });

const qrDataUrlSchema = z
  .string()
  .min(22)
  .max(131_072)
  .refine((value) => value.startsWith('data:image/'), {
    message: 'Data URL de imagen inválida',
  });

/**
 * Resultado de `generateTotpSecretAction`.
 * SEC-2: solo durante enrolamiento; no incluye el secreto Base32 en claro.
 */
export const generateTotpSecretActionResultSchema = z.discriminatedUnion('ok', [
  z
    .object({
      ok: z.literal(true),
      otpauthUri: otpauthUriSchema,
      qrDataUrl: qrDataUrlSchema,
    })
    .strict(),
  totpActionFailureSchema,
]);

export type GenerateTotpSecretActionResult = z.infer<
  typeof generateTotpSecretActionResultSchema
>;

export type TotpActionError = z.infer<typeof totpActionErrorSchema>;

export type TotpActionResult<T extends Record<string, unknown> | void = void> =
  | (T extends void ? { ok: true } : { ok: true } & T)
  | { ok: false; error: TotpActionError };
