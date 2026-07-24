import { z } from 'zod';

/** Mensaje genérico de fallo de login (SEC-1: no distinguir email/password/inactivo). */
export const LOGIN_INVALID_CREDENTIALS_MESSAGE =
  'Credenciales incorrectas. Comprueba email y contraseña.';

const emailField = z
  .string()
  .trim()
  .toLowerCase()
  .email()
  .max(254);

const passwordField = z.string().min(8).max(128);

export const totpCodeSchema = z
  .string()
  .length(6)
  .regex(/^\d{6}$/, 'El código TOTP debe tener 6 dígitos');

const totpField = totpCodeSchema;

/** Auth.js envía `totp: ""` cuando no hay 2FA; tratarlo como ausente. */
const optionalTotpField = z.preprocess(
  (value) =>
    value === '' || value === null || value === undefined ? undefined : value,
  totpField.optional(),
);

/**
 * Contrato compartido front/back para login del portal (Server Action GTK-69 y authorize).
 * SEC-6: objeto estricto — claves extra rechazadas.
 */
export const loginInputSchema = z
  .object({
    email: emailField,
    password: passwordField,
    totp: optionalTotpField,
  })
  .strict();

export type LoginInput = z.infer<typeof loginInputSchema>;

/**
 * Cuerpo de `POST /api/auth/callback/credentials` (Auth.js v5, form-urlencoded).
 * Incluye campos de credenciales más token CSRF obligatorio.
 */
export const credentialsCallbackBodySchema = z
  .object({
    email: emailField,
    password: passwordField,
    totp: optionalTotpField,
    csrfToken: z.string().min(1).max(512),
    callbackUrl: z.string().max(2048).optional(),
    json: z.enum(['true', 'false']).optional(),
  })
  .strict();

export type CredentialsCallbackBody = z.infer<
  typeof credentialsCallbackBodySchema
>;

export const loginActionErrorCodeSchema = z.enum([
  'VALIDATION_ERROR',
  'INVALID_CREDENTIALS',
  'RATE_LIMITED',
]);

export type LoginActionErrorCode = z.infer<typeof loginActionErrorCodeSchema>;

/** Resultado de `loginAction` (Server Action, no HTTP). */
export const loginActionResultSchema = z.discriminatedUnion('ok', [
  z.object({ ok: z.literal(true) }),
  z
    .object({
      ok: z.literal(false),
      error: z
        .object({
          code: loginActionErrorCodeSchema,
          message: z.string().max(500),
        })
        .strict(),
    })
    .strict(),
]);

export type LoginActionResult = z.infer<typeof loginActionResultSchema>;
