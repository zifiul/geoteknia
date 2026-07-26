const REF_PATTERN = /^[A-Z0-9-]{4,64}$/;

/** Sanitiza `?ref=` para display (evita payloads largos o caracteres no esperados). */
export function sanitizeReferenceParam(
  raw: string | string[] | undefined,
): string | null {
  if (raw === undefined) return null;
  const value = Array.isArray(raw) ? raw[0] : raw;
  if (!value) return null;
  const trimmed = value.trim().toUpperCase();
  if (!REF_PATTERN.test(trimmed)) return null;
  return trimmed;
}

const DOWNLOAD_PREFIX = '/api/recursos/download';

/** Solo rutas relativas de descarga construidas por el backend (SEC-TY2). */
export function sanitizeDownloadUrl(
  raw: string | string[] | undefined,
): string | null {
  if (raw === undefined) return null;
  const value = Array.isArray(raw) ? raw[0] : raw;
  if (!value) return null;
  const trimmed = value.trim();
  if (trimmed.length > 2048) return null;
  if (!trimmed.startsWith(DOWNLOAD_PREFIX)) return null;
  if (trimmed.includes('..') || trimmed.startsWith('//')) return null;
  if (/^https?:/i.test(trimmed)) return null;
  return trimmed;
}
