/**
 * GTK-43 — helpers puros de URL para metadata e imágenes (TDD-RED).
 */
import { describe, expect, it } from 'vitest';

import {
  buildMediaRemotePatterns,
  resolveMetadataBase,
} from '@/lib/seo/site-url';
import { resolveNextImageMediaSrc } from '@/lib/content/slug';

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

  it('incluye el puerto cuando la base de media no usa el puerto por defecto', () => {
    const patterns = buildMediaRemotePatterns('http://localhost:3000');
    expect(patterns).toEqual([
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3000',
        pathname: '/**',
      },
    ]);
  });

  it('rechaza URL inválida', () => {
    expect(() => buildMediaRemotePatterns('')).toThrow();
  });
});

describe('resolveNextImageMediaSrc', () => {
  it('devuelve ruta relativa cuando media y sitio comparten origen', () => {
    expect(
      resolveNextImageMediaSrc(
        '/images/maquinaria/hilti.jpg',
        'http://localhost:3000',
        'http://localhost:3000',
      ),
    ).toBe('/images/maquinaria/hilti.jpg');
  });

  it('devuelve URL absoluta del CDN cuando el origen es distinto', () => {
    expect(
      resolveNextImageMediaSrc(
        '/machinery/hutte.jpg',
        'https://cdn.example.com/media',
        'https://www.geoteknia.com',
      ),
    ).toBe('https://cdn.example.com/media/machinery/hutte.jpg');
  });

  it('normaliza URLs absolutas del mismo origen a ruta relativa', () => {
    expect(
      resolveNextImageMediaSrc(
        'http://localhost:3000/images/maquinaria/hilti.jpg',
        'http://localhost:3000',
        'http://localhost:3000',
      ),
    ).toBe('/images/maquinaria/hilti.jpg');
  });
});
