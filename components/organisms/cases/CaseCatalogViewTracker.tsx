'use client';

import { useEffect, useRef } from 'react';

import { hasAnalyticsConsent, readBrowserConsent } from '@/lib/analytics/consent';
import { pushRawDataLayer } from '@/lib/analytics/datalayer';
import type { PublishedCaseStudyCatalogItem } from '@/lib/content/case-studies';

export type CaseCatalogViewTrackerProps = {
  items: PublishedCaseStudyCatalogItem[];
};

export function CaseCatalogViewTracker({ items }: CaseCatalogViewTrackerProps) {
  const lastKey = useRef<string>('');

  useEffect(() => {
    const key = items.map((item) => item.id).join(',');
    if (key === lastKey.current) return;
    lastKey.current = key;

    const stored = readBrowserConsent();
    if (!stored || !hasAnalyticsConsent(stored.categories)) return;

    pushRawDataLayer({
      event: 'view_item_list',
      item_list_id: 'case_study_catalog',
      item_list_name: 'Catálogo de proyectos',
      items: items.map((item) => ({
        item_id: item.id,
        item_name: item.title,
        item_category: item.service.slug,
      })),
    });
  }, [items]);

  return null;
}
