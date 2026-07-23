import type { AuditAction } from '@prisma/client';

/** Claves comunes permitidas en metadata de cualquier acción. */
export const COMMON_METADATA_KEYS = ['correlationId', 'requestId'] as const;

/** Lista blanca de claves permitidas por tipo de acción (sin PII ni secretos). */
export const METADATA_WHITELIST: Record<AuditAction, readonly string[]> = {
  publish: [
    ...COMMON_METADATA_KEYS,
    'entitySlug',
    'workflowStatus',
    'previousStatus',
    'contentType',
  ],
  approve: [
    ...COMMON_METADATA_KEYS,
    'entitySlug',
    'previousStatus',
    'approverId',
    'contentType',
  ],
  reject: [
    ...COMMON_METADATA_KEYS,
    'entitySlug',
    'previousStatus',
    'reason',
    'contentType',
  ],
  delete: [
    ...COMMON_METADATA_KEYS,
    'entitySlug',
    'reason',
    'softDelete',
  ],
  login: [...COMMON_METADATA_KEYS, 'method', 'roleName'],
  login_failed: [...COMMON_METADATA_KEYS, 'method', 'attemptReason'],
  role_change: [
    ...COMMON_METADATA_KEYS,
    'targetUserId',
    'previousRole',
    'newRole',
  ],
  ai_generate: [
    ...COMMON_METADATA_KEYS,
    'generationId',
    'pageType',
    'model',
    'promptTemplateId',
  ],
  export: [
    ...COMMON_METADATA_KEYS,
    'exportType',
    'recordCount',
    'filterIds',
  ],
};

const SENSITIVE_KEY_PATTERN =
  /password|secret|totp|twofa|2fa|token|api[_-]?key|email|phone|full[_-]?name|address|dni|nif|cif/i;

function getAllowedKeys(action: AuditAction): Set<string> {
  return new Set(METADATA_WHITELIST[action]);
}

function isPrimitive(value: unknown): value is string | number | boolean {
  return (
    typeof value === 'string' ||
    typeof value === 'number' ||
    typeof value === 'boolean'
  );
}

/** En objetos anidados (p. ej. diff) solo conserva identificadores. */
function sanitizeNestedValue(value: unknown): unknown {
  if (value === null || isPrimitive(value)) {
    return value;
  }

  if (Array.isArray(value)) {
    const items = value
      .map((item) => sanitizeNestedValue(item))
      .filter((item) => item !== undefined);
    return items.length > 0 ? items : undefined;
  }

  if (typeof value === 'object') {
    const cleaned: Record<string, unknown> = {};
    for (const [key, nestedValue] of Object.entries(value as Record<string, unknown>)) {
      if (SENSITIVE_KEY_PATTERN.test(key)) {
        continue;
      }
      if (key === 'id' || key.endsWith('Id')) {
        cleaned[key] = nestedValue;
      }
    }
    return Object.keys(cleaned).length > 0 ? cleaned : undefined;
  }

  return undefined;
}

/**
 * Filtra metadata según whitelist por acción y redacta PII/secretos.
 * Retorna `null` si no queda contexto persistible.
 */
export function sanitizeAuditMetadata(
  action: AuditAction,
  metadata: Record<string, unknown>,
): Record<string, unknown> | null {
  const allowed = getAllowedKeys(action);
  const result: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(metadata)) {
    if (SENSITIVE_KEY_PATTERN.test(key)) {
      continue;
    }
    if (!allowed.has(key)) {
      continue;
    }

    const sanitized =
      value !== null && typeof value === 'object'
        ? sanitizeNestedValue(value)
        : isPrimitive(value) || value === null
          ? value
          : undefined;

    if (sanitized !== undefined) {
      result[key] = sanitized;
    }
  }

  return Object.keys(result).length > 0 ? result : null;
}

export function isSensitiveMetadataKey(key: string): boolean {
  return SENSITIVE_KEY_PATTERN.test(key);
}
