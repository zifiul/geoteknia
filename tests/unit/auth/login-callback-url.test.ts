/**
 * GTK-69 — resolveLoginCallbackUrl (SEC-2).
 */
import { describe, expect, it } from 'vitest';

import { resolveLoginCallbackUrl } from '@/lib/auth/login-callback-url';

describe('resolveLoginCallbackUrl (GTK-69)', () => {
  it('usa /admin por defecto', () => {
    expect(resolveLoginCallbackUrl(undefined)).toBe('/admin');
    expect(resolveLoginCallbackUrl('')).toBe('/admin');
  });

  it('acepta path interno con query', () => {
    expect(resolveLoginCallbackUrl('/admin/proyectos?tab=1')).toBe(
      '/admin/proyectos?tab=1',
    );
  });

  it('rechaza URL externa o protocol-relative', () => {
    expect(resolveLoginCallbackUrl('https://evil.test/phish')).toBe('/admin');
    expect(resolveLoginCallbackUrl('//evil.test/phish')).toBe('/admin');
  });
});
