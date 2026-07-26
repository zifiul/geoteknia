import Link from 'next/link';

import { buildBlogListingPath } from '@/lib/blog/catalog-config';
import type { BlogCategoryNavItem } from '@/components/organisms/blog/CategoryNav';

export type BlogCatalogEmptyProps = {
  categoryName: string;
  otherCategories: BlogCategoryNavItem[];
};

export function BlogCatalogEmpty({ categoryName, otherCategories }: BlogCatalogEmptyProps) {
  return (
    <div
      className="rounded-lg border border-dashed border-brand-secondary/25 bg-brand-neutral/30 px-6 py-12 text-center"
      data-testid="blog-catalog-empty"
    >
      <h2 className="font-display text-xl font-semibold text-brand-on-surface">
        Aún no hay artículos en {categoryName}
      </h2>
      <p className="mx-auto mt-3 max-w-md text-sm text-muted">
        Estamos preparando contenido para esta categoría. Mientras tanto, explora otras
        secciones del blog o contacta con nuestro equipo técnico.
      </p>
      {otherCategories.length > 0 ? (
        <ul className="mt-6 flex flex-wrap justify-center gap-2">
          {otherCategories.map((category) => (
            <li key={category.slug}>
              <Link
                href={buildBlogListingPath(category.slug)}
                className="inline-flex rounded-full bg-brand-surface px-4 py-2 text-sm font-medium text-brand-accent shadow-sm hover:underline"
              >
                {category.name}
              </Link>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
