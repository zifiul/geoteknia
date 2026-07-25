'use client';

import Link from 'next/link';
import type { ComponentProps, ReactNode } from 'react';

import type { PublishedCaseStudyCatalogItem } from '@/lib/content/case-studies';
import { hasAnalyticsConsent, readBrowserConsent } from '@/lib/analytics/consent';
import { pushRawDataLayer } from '@/lib/analytics/datalayer';

export type CaseCardSelectLinkProps = Omit<ComponentProps<typeof Link>, 'children'> & {
  item: PublishedCaseStudyCatalogItem;
  children: ReactNode;
};

export function CaseCardSelectLink({
  item,
  children,
  onClick,
  ...props
}: CaseCardSelectLinkProps) {
  return (
    <Link
      {...props}
      onClick={(event) => {
        const stored = readBrowserConsent();
        if (stored && hasAnalyticsConsent(stored.categories)) {
          pushRawDataLayer({
            event: 'select_item',
            item_list_id: 'case_study_catalog',
            item_list_name: 'Catálogo de proyectos',
            items: [
              {
                item_id: item.id,
                item_name: item.title,
                item_category: item.service.slug,
              },
            ],
          });
        }
        onClick?.(event);
      }}
    >
      {children}
    </Link>
  );
}
