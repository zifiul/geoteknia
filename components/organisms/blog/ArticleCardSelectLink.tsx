'use client';

import Link from 'next/link';
import type { ComponentProps, ReactNode } from 'react';

import type { PublishedBlogCatalogItem } from '@/lib/content/blog-faqs';
import { hasAnalyticsConsent, readBrowserConsent } from '@/lib/analytics/consent';
import { pushRawDataLayer } from '@/lib/analytics/datalayer';

export type ArticleCardSelectLinkProps = Omit<ComponentProps<typeof Link>, 'children'> & {
  item: PublishedBlogCatalogItem;
  children: ReactNode;
};

export function ArticleCardSelectLink({
  item,
  children,
  onClick,
  ...props
}: ArticleCardSelectLinkProps) {
  return (
    <Link
      {...props}
      onClick={(event) => {
        const stored = readBrowserConsent();
        if (stored && hasAnalyticsConsent(stored.categories)) {
          pushRawDataLayer({
            event: 'select_item',
            item_list_id: 'blog_catalog',
            item_list_name: 'Blog Geoteknia',
            items: [
              {
                item_id: item.id,
                item_name: item.title,
                item_category: item.category.slug,
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
