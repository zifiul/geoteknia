'use client';

import { useEffect, useRef } from 'react';

import { hasAnalyticsConsent, readBrowserConsent } from '@/lib/analytics/consent';
import { pushRawDataLayer } from '@/lib/analytics/datalayer';
import type { PublishedBlogCatalogItem } from '@/lib/content/blog-faqs';

export type BlogCatalogViewTrackerProps = {
  items: PublishedBlogCatalogItem[];
  listName?: string;
};

export function BlogCatalogViewTracker({
  items,
  listName = 'Blog Geoteknia',
}: BlogCatalogViewTrackerProps) {
  const lastKey = useRef<string>('');

  useEffect(() => {
    const key = items.map((item) => item.id).join(',');
    if (key === lastKey.current) return;
    lastKey.current = key;

    const stored = readBrowserConsent();
    if (!stored || !hasAnalyticsConsent(stored.categories)) return;

    pushRawDataLayer({
      event: 'view_item_list',
      item_list_id: 'blog_catalog',
      item_list_name: listName,
      items: items.map((item) => ({
        item_id: item.id,
        item_name: item.title,
        item_category: item.category.slug,
      })),
    });
  }, [items, listName]);

  return null;
}
