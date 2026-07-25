/**
 * GTK-43 — helpers puros de URL para metadata e imágenes (TDD-RED).
 */
import { describe, expect, it } from 'vitest';

import {
  buildMediaRemotePatterns,
  resolveMetadataBase,
} from '@/lib/seo/site-url';

describe('resolveMetadataBase', () => {
  it('resuelve una URL absoluta válida', () => {
    expect(resolveMetadataBase('https://www.geoteknia.com').href).toBe(
      'https://www.geoteknia.com/',
    );
  });

  it('rechaza strings que no son URL (SEC-3)', () => {
    expect(() => resolveMetadataBase('not-a-url')).toThrow();
  });
});

describe('buildMediaRemotePatterns', () => {
  it('restringe al hostname del CDN (SEC-1)', () => {
    const patterns = buildMediaRemotePatterns(
      'https://cdn.example.com/media',
    );
    expect(patterns).toEqual([
      {
        protocol: 'https',
        hostname: 'cdn.example.com',
        pathname: '/media/**',
      },
    ]);
  });

  it('rechaza URL inválida', () => {
    expect(() => buildMediaRemotePatterns('')).toThrow();
  });
});
