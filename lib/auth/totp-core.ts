import { generateSecret, generateURI, verify } from 'otplib';

const TOTP_ISSUER = 'Geoteknia';
/** Ventana ±1 periodo (30 s) para desfase de reloj. */
const EPOCH_TOLERANCE_SECONDS = 30;

export type TotpEnrollment = {
  secret: string;
  otpauthUri: string;
};

/**
 * Genera un secreto TOTP y la URI `otpauth://` para QR / entrada manual.
 */
export function generateTotpSecret(label: string): TotpEnrollment {
  const secret = generateSecret();
  const otpauthUri = generateURI({
    issuer: TOTP_ISSUER,
    label,
    secret,
  });
  return { secret, otpauthUri };
}

/** Verifica un código TOTP de 6 dígitos contra el secreto en claro (solo servidor). */
export async function verifyTotpCode(
  secret: string,
  code: string,
): Promise<boolean> {
  const result = await verify({
    secret,
    token: code,
    epochTolerance: EPOCH_TOLERANCE_SECONDS,
  });
  return result.valid;
}
