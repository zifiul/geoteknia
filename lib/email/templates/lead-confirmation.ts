/** Copy pendiente de validación con negocio (GTK-27). */
export const TECHNICIAN_FALLBACK_COPY =
  '[PENDIENTE: copy de fallback de técnico no asignado a validar con negocio]';

export const RESPONSE_DEADLINE_COPY = '48 horas laborables';

export type LeadConfirmationEmailProps = {
  referenceNumber: string;
  technicianName: string;
  serviceName: string;
  province: string;
};

export function buildLeadConfirmationSubject(referenceNumber: string): string {
  return `Confirmación de solicitud — Ref. ${referenceNumber}`;
}

export function resolveTechnicianDisplayName(
  technicianName: string | null | undefined,
): string {
  const trimmed = technicianName?.trim();
  return trimmed && trimmed.length > 0 ? trimmed : TECHNICIAN_FALLBACK_COPY;
}
