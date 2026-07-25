import { unstable_cache } from 'next/cache';

import { buildImageSitemapXml } from '@/lib/seo/build-image-sitemap-xml';
import {
  SITEMAP_CACHE_TAG,
  SITEMAP_REVALIDATE_SECONDS,
} from '@/lib/seo/sitemap-config';
import { getIndexableImageEntries } from '@/lib/seo/sitemap-sources';

export const revalidate = 3600;

const loadImages = unstable_cache(
  async () => getIndexableImageEntries(),
  ['sitemap-image-entries'],
  {
    revalidate: SITEMAP_REVALIDATE_SECONDS,
    tags: [SITEMAP_CACHE_TAG],
  },
);

export async function GET(): Promise<Response> {
  const entries = await loadImages();
  const body = buildImageSitemapXml(entries);
  return new Response(body, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
    },
  });
}
