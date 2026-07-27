'use client';

import { useEffect } from 'react';

import { hasAnalyticsConsent, readBrowserConsent } from '@/lib/analytics/consent';
import { pushRawDataLayer } from '@/lib/analytics/datalayer';

export type CaseStudyViewTrackerProps = {
  caseId: string;
  title: string;
  serviceSlug: string;
  provinceSlug: string;
};

export function CaseStudyViewTracker({
  caseId,
  title,
  serviceSlug,
  provinceSlug,
}: CaseStudyViewTrackerProps) {
  useEffect(() => {
    const stored = readBrowserConsent();
    if (!stored || !hasAnalyticsConsent(stored.categories)) {
      return;
    }
    pushRawDataLayer({
      event: 'view_item',
      item_id: caseId,
      item_name: title,
      item_category: serviceSlug,
      province_slug: provinceSlug,
    });
  }, [caseId, title, serviceSlug, provinceSlug]);

  return null;
}
