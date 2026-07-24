/**
 * Punto de extensión TOTP (GTK-24). Mientras sea null, 2FA fail-closed.
 */
export type VerifyTotpFn = (userId: string, code: string) => Promise<boolean>;

let verifyTotpImpl: VerifyTotpFn | null = null;

export function registerVerifyTotp(fn: VerifyTotpFn): void {
  verifyTotpImpl = fn;
}

export function isTotpVerifierAvailable(): boolean {
  return verifyTotpImpl !== null;
}

export async function verifyTotp(
  userId: string,
  code: string,
): Promise<boolean> {
  if (!verifyTotpImpl) {
    return false;
  }
  return verifyTotpImpl(userId, code);
}
