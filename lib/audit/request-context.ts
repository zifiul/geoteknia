/**
 * Extrae IP y user-agent de headers HTTP para pasarlos explícitamente a recordAudit.
 * Mantiene recordAudit puro/testeable sin depender de Request.
 */
export function extractRequestAuditContext(headers: Headers): {
  ip: string | null;
  userAgent: string | null;
} {
  const forwarded = headers.get('x-forwarded-for');
  const ip =
    forwarded?.split(',')[0]?.trim() ??
    headers.get('x-real-ip') ??
    headers.get('cf-connecting-ip') ??
    null;

  return {
    ip,
    userAgent: headers.get('user-agent'),
  };
}
