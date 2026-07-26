import { describe, expect, it } from 'vitest';

import {
  sanitizeDownloadUrl,
  sanitizeReferenceParam,
} from '@/lib/thankyou/sanitize';

describe('sanitizeReferenceParam', () => {
  it('acepta referencia válida PRE-', () => {
    expect(sanitizeReferenceParam('PRE-20260726-ABCD')).toBe(
      'PRE-20260726-ABCD',
    );
  });

  it('rechaza script o caracteres inválidos', () => {
    expect(sanitizeReferenceParam('<script>')).toBeNull();
    expect(sanitizeReferenceParam('')).toBeNull();
  });
});

describe('sanitizeDownloadUrl (SEC-TY2)', () => {
  it('acepta ruta /api/recursos/download', () => {
    expect(
      sanitizeDownloadUrl('/api/recursos/download?token=abc'),
    ).toBe('/api/recursos/download?token=abc');
  });

  it('rechaza URL absoluta y path traversal', () => {
    expect(sanitizeDownloadUrl('https://evil.test/x')).toBeNull();
    expect(sanitizeDownloadUrl('/api/recursos/download/../admin')).toBeNull();
    expect(sanitizeDownloadUrl('//evil.test')).toBeNull();
  });
});
