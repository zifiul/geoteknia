import { ArticleCard } from '@/components/organisms/blog/ArticleCard';
import { BlogCatalogEmpty } from '@/components/organisms/blog/BlogCatalogEmpty';
import { BlogCatalogViewTracker } from '@/components/organisms/blog/BlogCatalogViewTracker';
import { BlogPagination } from '@/components/organisms/blog/BlogPagination';
import {
  CategoryNav,
  type BlogCategoryNavItem,
} from '@/components/organisms/blog/CategoryNav';
import { PaginationLinks } from '@/components/seo/pagination-links';
import type { BlogCatalogPageResult } from '@/lib/content/blog-faqs';

export type BlogListingViewProps = {
  title: string;
  description: string;
  categories: BlogCategoryNavItem[];
  activeCategorySlug: string | null;
  catalog: BlogCatalogPageResult;
  categorySlug?: string | null;
  categoryNameForEmpty?: string;
  prevUrl?: string;
  nextUrl?: string;
  trackerListName?: string;
};

export function BlogListingView({
  title,
  description,
  categories,
  activeCategorySlug,
  catalog,
  categorySlug,
  categoryNameForEmpty,
  prevUrl,
  nextUrl,
  trackerListName,
}: BlogListingViewProps) {
  const otherCategories = categories.filter((c) => c.slug !== activeCategorySlug);
  const showCategoryEmpty =
    catalog.items.length === 0 && activeCategorySlug != null && categoryNameForEmpty;

  return (
    <>
      <PaginationLinks prev={prevUrl} next={nextUrl} />
      <BlogCatalogViewTracker items={catalog.items} listName={trackerListName} />
      <div className="bg-brand-surface">
        <div className="border-b border-brand-secondary/10 bg-brand-neutral/40 py-10 md:py-14">
          <div className="mx-auto max-w-[1200px] px-4">
            <p className="text-sm font-medium uppercase tracking-wide text-brand-secondary">
              Conocimiento geotécnico
            </p>
            <h1 className="mt-2 font-display text-3xl font-semibold text-brand-on-surface md:text-4xl">
              {title}
            </h1>
            <p className="mt-3 max-w-2xl text-base text-muted">{description}</p>
            <div className="mt-8">
              <CategoryNav categories={categories} activeCategorySlug={activeCategorySlug} />
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-[1200px] px-4 py-10">
          <p
            className="text-sm text-muted"
            aria-live="polite"
            aria-atomic="true"
            data-testid="blog-catalog-result-count"
          >
            {catalog.total === 0
              ? '0 artículos'
              : `${catalog.total} ${catalog.total === 1 ? 'artículo' : 'artículos'}`}
          </p>

          {showCategoryEmpty ? (
            <div className="mt-8">
              <BlogCatalogEmpty
                categoryName={categoryNameForEmpty}
                otherCategories={otherCategories}
              />
            </div>
          ) : catalog.items.length === 0 ? (
            <p className="mt-8 text-center text-muted">Aún no hay artículos publicados.</p>
          ) : (
            <ul className="mt-6 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {catalog.items.map((item) => (
                <li key={item.id}>
                  <ArticleCard item={item} />
                </li>
              ))}
            </ul>
          )}

          <BlogPagination
            page={catalog.page}
            totalPages={catalog.totalPages}
            categorySlug={categorySlug}
            prevUrl={prevUrl}
            nextUrl={nextUrl}
          />
        </div>
      </div>
    </>
  );
}
