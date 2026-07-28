/** Enmascara IP para el listado (Stitch A2 — no exponer host completo en tabla). */
export function maskAuditIpForList(ip: string | null | undefined): string {
  if (!ip?.trim()) {
    return '—';
  }
  const trimmed = ip.trim();
  if (trimmed.includes('.')) {
    const parts = trimmed.split('.');
    if (parts.length === 4) {
      return `${parts[0]}.${parts[1]}.*.*`;
    }
  }
  if (trimmed.includes(':')) {
    const segments = trimmed.split(':').filter(Boolean);
    if (segments.length >= 2) {
      return `${segments[0]}:${segments[1]}:…`;
    }
  }
  return '***';
}
