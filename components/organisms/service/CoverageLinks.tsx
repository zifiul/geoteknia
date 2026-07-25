import Link from 'next/link';

import type { PublishedServiceZonePageLink } from '@/lib/content/service-zone-pages';
import { buildSiloPath } from '@/lib/seo/silo-urls';

export type ServiceCoverageLinksProps = {
  serviceSlug: string;
  pages: PublishedServiceZonePageLink[];
};

export function ServiceCoverageLinks({ serviceSlug, pages }: ServiceCoverageLinksProps) {
  if (pages.length === 0) {
    return null;
  }

  return (
    <section className="bg-brand-neutral/50 py-12 md:py-16" aria-labelledby="service-coverage-heading">
      <div className="mx-auto max-w-[1200px] px-4">
        <h2
          id="service-coverage-heading"
          className="font-display text-2xl font-semibold text-brand-on-surface md:text-3xl"
        >
          Cobertura por zona
        </h2>
        <p className="mt-2 max-w-2xl text-sm text-muted md:text-base">
          Geo-landings publicadas con contenido específico servicio + territorio.
        </p>
        <ul className="mt-6 flex flex-wrap gap-3">
          {pages.map((page) => (
            <li key={page.id}>
              <Link
                href={buildSiloPath('service_zone_page', {
                  slug: page.slug,
                  serviceSlug,
                  zoneSlug: page.zoneSlug,
                })}
                className="inline-flex min-h-11 items-center rounded-full border border-brand-secondary/25 bg-brand-surface px-4 py-2 text-sm font-semibold text-brand-on-surface hover:border-brand-accent hover:text-brand-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent"
              >
                {page.title}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
