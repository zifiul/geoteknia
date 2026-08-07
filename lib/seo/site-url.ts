export type MediaRemotePattern = {
  protocol: 'http' | 'https';
  hostname: string;
  port?: string;
  pathname?: string;
};

/**
 * Origen absoluto para Metadata API (`metadataBase`).
 */
export function resolveMetadataBase(siteUrl: string): URL {
  let parsed: URL;
  try {
    parsed = new URL(siteUrl);
  } catch {
    throw new Error('NEXT_PUBLIC_SITE_URL debe ser una URL absoluta válida');
  }
  if (!parsed.protocol.startsWith('http')) {
    throw new Error('NEXT_PUBLIC_SITE_URL debe usar http o https');
  }
  return parsed;
}

/**
 * Patrones remotos para `next/image` acotados al CDN de media (SEC-1).
 */
export function buildMediaRemotePatterns(
  mediaBaseUrl: string,
): MediaRemotePattern[] {
  let parsed: URL;
  try {
    parsed = new URL(mediaBaseUrl);
  } catch {
    throw new Error('MEDIA_STORAGE_BASE_URL debe ser una URL absoluta válida');
  }
  if (!parsed.protocol.startsWith('http')) {
    throw new Error('MEDIA_STORAGE_BASE_URL debe usar http o https');
  }

  const protocol = parsed.protocol.replace(':', '') as 'http' | 'https';
  const pathnameBase = parsed.pathname.replace(/\/$/, '') || '';
  const pathname = `${pathnameBase}/**`;

  const pattern: MediaRemotePattern = {
    protocol,
    hostname: parsed.hostname,
    pathname,
  };
  if (parsed.port) {
    pattern.port = parsed.port;
  }

  return [pattern];
}
