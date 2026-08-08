import type { NextConfig } from 'next';

import {
  buildMediaRemotePatterns,
  type MediaRemotePattern,
} from '@/lib/seo/site-url';

const mediaBaseUrl =
  process.env.MEDIA_STORAGE_BASE_URL ?? 'https://cdn.example.com/media';

function dedupeRemotePatterns(patterns: MediaRemotePattern[]): MediaRemotePattern[] {
  const seen = new Set<string>();
  return patterns.filter((pattern) => {
    const key = JSON.stringify(pattern);
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}

function buildImageRemotePatterns(): MediaRemotePattern[] {
  const patterns = [...buildMediaRemotePatterns(mediaBaseUrl)];
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (siteUrl && siteUrl !== mediaBaseUrl) {
    try {
      patterns.push(...buildMediaRemotePatterns(siteUrl));
    } catch {
      // Ignorar URL de sitio inválida en tiempo de build.
    }
  }
  return dedupeRemotePatterns(patterns);
}

const nextConfig: NextConfig = {
  experimental: {
    useTypeScriptCli: true,
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: buildImageRemotePatterns(),
    // Solo en local: MEDIA_STORAGE_BASE_URL puede apuntar a localhost (seed sin CDN real).
    // Next bloquea por defecto imágenes remotas resueltas a IP privada/loopback (SSRF).
    dangerouslyAllowLocalIP: process.env.NODE_ENV !== 'production',
  },
};

export default nextConfig;
