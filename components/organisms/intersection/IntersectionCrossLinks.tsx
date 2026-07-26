import Link from 'next/link';

import type { PublishedServiceZonePageDetail } from '@/lib/content/service-zone-pages';
import { buildSiloPath } from '@/lib/seo/silo-urls';

export type IntersectionCrossLinksProps = {
  page: PublishedServiceZonePageDetail;
};

export function IntersectionCrossLinks({ page }: IntersectionCrossLinksProps) {
  const { service, zone } = page;
  const serviceHref = buildSiloPath('service', { slug: service.slug });
  const zoneHref = buildSiloPath('geo_zone', { slug: zone.slug });

  return (
    <section
      className="bg-brand-neutral/50 py-12 md:py-16"
      aria-labelledby="intersection-links-heading"
    >
      <div className="mx-auto max-w-[1200px] px-4">
        <h2
          id="intersection-links-heading"
          className="font-display text-2xl font-semibold text-brand-on-surface md:text-3xl"
        >
          Más información
        </h2>
        <p className="mt-2 max-w-2xl text-sm text-muted md:text-base">
          Consulta la ficha completa del servicio o la cobertura territorial de la zona.
        </p>
        <ul className="mt-6 flex flex-col gap-4 sm:flex-row sm:flex-wrap">
          <li>
            <Link
              href={serviceHref}
              className="inline-flex min-h-11 items-center rounded-lg border border-brand-secondary/20 bg-brand-surface px-5 py-3 text-sm font-semibold text-brand-on-surface hover:border-brand-accent hover:text-brand-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent"
            >
              Ver servicio: {service.name}
            </Link>
          </li>
          <li>
            <Link
              href={zoneHref}
              className="inline-flex min-h-11 items-center rounded-lg border border-brand-secondary/20 bg-brand-surface px-5 py-3 text-sm font-semibold text-brand-on-surface hover:border-brand-accent hover:text-brand-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent"
            >
              Ver zona: {zone.name}
            </Link>
          </li>
        </ul>
      </div>
    </section>
  );
}
