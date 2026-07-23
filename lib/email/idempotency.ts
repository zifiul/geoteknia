import 'server-only';

/**
 * Registro in-memory de confirmaciones enviadas por referenceNumber.
 * MVP: evita duplicados en reintentos del mismo proceso.
 * Fase 2: persistir en BD (tabla email_deliveries) para idempotencia cross-instance.
 */
const sentLeadConfirmations = new Map<string, string>();

export function hasLeadConfirmationBeenSent(referenceNumber: string): boolean {
  return sentLeadConfirmations.has(referenceNumber);
}

export function getLeadConfirmationResendId(
  referenceNumber: string,
): string | undefined {
  return sentLeadConfirmations.get(referenceNumber);
}

export function registerLeadConfirmationSent(
  referenceNumber: string,
  resendId: string,
): void {
  sentLeadConfirmations.set(referenceNumber, resendId);
}

/** Solo para tests: vacía el registro in-memory. */
export function clearLeadConfirmationRegistryForTests(): void {
  sentLeadConfirmations.clear();
}
