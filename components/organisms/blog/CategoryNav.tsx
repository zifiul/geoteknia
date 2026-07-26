'use client';

import Link from 'next/link';

import {
  BLOG_CATALOG_BASE_PATH,
  buildBlogListingPath,
} from '@/lib/blog/catalog-config';
import { hasAnalyticsConsent, readBrowserConsent } from '@/lib/analytics/consent';
import { pushRawDataLayer } from '@/lib/analytics/datalayer';

export type BlogCategoryNavItem = {
  name: string;
  slug: string;
};

export type CategoryNavProps = {
  categories: BlogCategoryNavItem[];
  /** Slug de categoría activa; `null` en el índice `/blog`. */
  activeCategorySlug: string | null;
};

export function CategoryNav({ categories, activeCategorySlug }: CategoryNavProps) {
  const trackFilter = (categorySlug: string | null) => {
    const stored = readBrowserConsent();
    if (!stored || !hasAnalyticsConsent(stored.categories)) return;
    pushRawDataLayer({
      event: 'filter_use',
      filter_type: 'blog_category',
      filter_value: categorySlug ?? 'all',
    });
  };

  return (
    <nav aria-label="Categorías del blog" className="w-full">
      <ul className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <li className="shrink-0">
          <Link
            href={BLOG_CATALOG_BASE_PATH}
            aria-current={activeCategorySlug === null ? 'page' : undefined}
            onClick={() => trackFilter(null)}
            className={`inline-flex rounded-full px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent ${
              activeCategorySlug === null
                ? 'bg-brand-accent text-white'
                : 'bg-brand-neutral/60 text-brand-on-surface hover:bg-brand-neutral'
            }`}
          >
            Todos
          </Link>
        </li>
        {categories.map((category) => {
          const isActive = activeCategorySlug === category.slug;
          return (
            <li key={category.slug} className="shrink-0">
              <Link
                href={buildBlogListingPath(category.slug)}
                aria-current={isActive ? 'page' : undefined}
                onClick={() => trackFilter(category.slug)}
                className={`inline-flex rounded-full px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent ${
                  isActive
                    ? 'bg-brand-accent text-white'
                    : 'bg-brand-neutral/60 text-brand-on-surface hover:bg-brand-neutral'
                }`}
              >
                {category.name}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
