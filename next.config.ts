import type { NextConfig } from 'next';

import { buildMediaRemotePatterns } from '@/lib/seo/site-url';

const mediaBaseUrl =
  process.env.MEDIA_STORAGE_BASE_URL ?? 'https://cdn.example.com/media';

const nextConfig: NextConfig = {
  experimental: {
    useTypeScriptCli: true,
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: buildMediaRemotePatterns(mediaBaseUrl),
  },
};

export default nextConfig;
