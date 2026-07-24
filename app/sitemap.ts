import type { MetadataRoute } from 'next';
import { unstable_cache } from 'next/cache';

import {
  SITEMAP_CACHE_TAG,
  SITEMAP_REVALIDATE_SECONDS,
} from '@/lib/seo/sitemap-config';
import { gatherMainSitemapEntries } from '@/lib/seo/sitemap-sources';

export const revalidate = SITEMAP_REVALIDATE_SECONDS;

const loadSitemap = unstable_cache(
  async () => gatherMainSitemapEntries(),
  ['sitemap-main-entries'],
  {
    revalidate: SITEMAP_REVALIDATE_SECONDS,
    tags: [SITEMAP_CACHE_TAG],
  },
);

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries = await loadSitemap();
  return entries.map((entry) => ({
    url: entry.url,
    lastModified: entry.lastModified,
    changeFrequency: entry.changeFrequency,
    priority: entry.priority,
  }));
}
